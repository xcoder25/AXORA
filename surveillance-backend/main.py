import asyncio
import json
import logging
from typing import Dict, List, Any
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import requests
import redis
import cv2

from config import settings
from services.discovery import WSDiscovery
from pipeline.processor import StreamAIProcessor
from adapters.axis import AxisAdapter
from adapters.hikvision import HikvisionAdapter
from adapters.dahua import DahuaAdapter
from adapters.hanwha import HanwhaAdapter
from adapters.generic import GenericONVIFAdapter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SurveillanceMain")

app = FastAPI(
    title="AXORA Surveillance Integration Layer",
    description="Multi-brand CCTV Integration, low-latency streaming gateway, and YOLO real-time AI Pipeline.",
    version="1.0.0"
)

# Enable CORS for Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registry of active cameras and their corresponding AI pipeline threads
# In production, this can be backed by a relational/key-value store, but we manage active resources in-memory
cameras_db: Dict[str, Dict[str, Any]] = {}
active_processors: Dict[str, StreamAIProcessor] = {}

class ConnectionManager:
    """Manages active WebSocket connections for streaming real-time AI telemetry."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

def get_adapter(camera: Dict[str, Any]):
    """Instantiates the correct vendor-specific adapter based on brand."""
    brand = camera.get("brand", "").lower()
    ip = camera.get("ip")
    port = camera.get("port", 554)
    username = camera.get("username", "")
    password = camera.get("password", "")
    extra = camera.get("extra_config", {})
    
    if brand == "axis":
        return AxisAdapter(ip, port, username, password, extra)
    elif brand == "hikvision":
        return HikvisionAdapter(ip, port, username, password, extra)
    elif brand == "dahua":
        return DahuaAdapter(ip, port, username, password, extra)
    elif brand == "hanwha":
        return HanwhaAdapter(ip, port, username, password, extra)
    else:
        return GenericONVIFAdapter(ip, port, username, password, extra)

# Background task to stream Redis Pub/Sub events to WebSockets
async def redis_event_streamer():
    """Reads AI detections from Redis Pub/Sub and broadcasts them to all connected dashboard WebSockets."""
    r = None
    while True:
        try:
            r = redis.from_url(settings.REDIS_URL, decode_responses=True)
            pubsub = r.pubsub()
            pubsub.subscribe("surveillance_events")
            logger.info("Connected to Redis Pub/Sub. Streaming events...")
            
            for message in pubsub.listen():
                if message["type"] == "message":
                    await manager.broadcast(message["data"])
                    
        except Exception as e:
            logger.error(f"Redis event streamer error: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    # Start Redis background listener task
    asyncio.create_task(redis_event_streamer())
    
    # Pre-populate some initial camera slots for demonstration if needed
    cameras_db["CAM-01"] = {
        "id": "CAM-01",
        "name": "Main Entrance",
        "brand": "hikvision",
        "ip": "192.168.1.64",
        "port": 554,
        "username": "admin",
        "password": "Password123",
        "status": "Online",
        "rtsp_url": "rtsp://admin:Password123@192.168.1.64:554/Streaming/Channels/101"
    }

@app.on_event("shutdown")
def shutdown_event():
    # Stop all AI pipeline processors
    for pid, proc in list(active_processors.items()):
        proc.stop()
        proc.join()
    logger.info("All surveillance processes cleaned up.")

@app.get("/api/cameras")
def list_cameras():
    return list(cameras_db.values())

@app.get("/api/cameras/discovery")
def discover_cameras():
    """Scans the local network for ONVIF devices using WS-Discovery."""
    try:
        results = WSDiscovery.scan(timeout=2.0, include_mocks=True)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cameras")
def add_camera(camera: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Registers a new camera.
    1. Resolves standard RTSP url.
    2. Registers stream with go2rtc.
    3. Launches the AI processing pipeline thread.
    """
    cid = camera.get("id")
    if not cid:
        raise HTTPException(status_code=400, detail="Camera 'id' is required")
        
    adapter = get_adapter(camera)
    probe_res = adapter.probe()
    
    # Generate standardized RTSP url
    rtsp_url = adapter.get_rtsp_url()
    camera["rtsp_url"] = rtsp_url
    camera["status"] = "Online" if probe_res["status"] == "online" else "Offline"
    camera["model"] = probe_res["model"]
    camera["capabilities"] = probe_res["capabilities"]
    
    cameras_db[cid] = camera
    
    # Register stream with go2rtc gateway
    try:
        gateway_url = f"{settings.GO2RTC_URL}/api/streams"
        requests.patch(f"{gateway_url}?name={cid}&src={rtsp_url}", timeout=2)
        logger.info(f"Stream {cid} registered with go2rtc: {rtsp_url}")
    except Exception as e:
        logger.warning(f"Could not connect to go2rtc to register stream: {e}. Running in standalone mode.")

    # Spawn real-time AI processing pipeline thread
    # For testing, we read from go2rtc or fall back directly to RTSP stream
    stream_source = f"{settings.GO2RTC_URL}/api/streams/{cid}"
    if "localhost" in settings.GO2RTC_URL:
        # If running locally, go2rtc is accessible via rtsp://localhost:8554/{cid}
        stream_source = f"rtsp://127.0.0.1:8554/{cid}"
        
    # Standard fallback to direct rtsp URL if gateway isn't active
    if "go2rtc" not in settings.GO2RTC_URL:
        stream_source = rtsp_url

    # Stop any existing processor for this camera
    if cid in active_processors:
        active_processors[cid].stop()
        active_processors[cid].join()
        
    processor = StreamAIProcessor(camera_id=cid, stream_url=stream_source)
    active_processors[cid] = processor
    processor.start()

    return {"status": "success", "camera": camera}

@app.delete("/api/cameras/{id}")
def delete_camera(id: str):
    if id not in cameras_db:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    # Stop processor
    if id in active_processors:
        active_processors[id].stop()
        active_processors[id].join()
        del active_processors[id]
        
    # Unregister from go2rtc
    try:
        requests.delete(f"{settings.GO2RTC_URL}/api/streams?name={id}", timeout=2)
    except Exception as e:
        logger.warning(f"Could not unregister stream from go2rtc: {e}")
        
    del cameras_db[id]
    return {"status": "success", "message": f"Camera {id} unlinked successfully"}

@app.post("/api/cameras/{id}/ptz")
def ptz_control(id: str, command: Dict[str, Any]):
    if id not in cameras_db:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    camera = cameras_db[id]
    adapter = get_adapter(camera)
    
    pan = float(command.get("pan", 0.0))
    tilt = float(command.get("tilt", 0.0))
    zoom = float(command.get("zoom", 0.0))
    preset = command.get("preset_id")
    
    success = False
    if preset:
        success = adapter.trigger_preset(preset)
    else:
        success = adapter.ptz_control(pan, tilt, zoom)
        
    return {"status": "success" if success else "failed"}

@app.get("/api/cameras/{id}/snapshot")
def get_snapshot(id: str):
    """Captures a single frame from the RTSP stream using OpenCV and returns it as JPEG."""
    if id not in cameras_db:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    camera = cameras_db[id]
    rtsp_url = camera.get("rtsp_url", "")
    
    # Grab a frame via cv2
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        # Return fallback placeholder image if camera is offline
        fallback_img = cv2.imread("data/placeholder.jpg")
        if fallback_img is None:
            # Generate black image with text as fallback
            import numpy as np
            fallback_img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(fallback_img, "Camera Offline", (150, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
        _, encoded_img = cv2.imencode(".jpg", fallback_img)
        return Response(content=encoded_img.tobytes(), media_type="image/jpeg")
        
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise HTTPException(status_code=500, detail="Failed to grab frame from camera stream")
        
    _, encoded_img = cv2.imencode(".jpg", frame)
    return Response(content=encoded_img.tobytes(), media_type="image/jpeg")

@app.get("/api/cameras/health")
def get_health():
    """Returns microservice telemetry, connected cameras, and computed AI load."""
    redis_online = False
    try:
        r = redis.from_url(settings.REDIS_URL, socket_timeout=1)
        r.ping()
        redis_online = True
    except Exception:
        pass
        
    go2rtc_online = False
    try:
        requests.get(settings.GO2RTC_URL, timeout=1)
        go2rtc_online = True
    except Exception:
        pass
        
    return {
        "status": "healthy",
        "redis": "Connected" if redis_online else "Disconnected",
        "go2rtc": "Connected" if go2rtc_online else "Disconnected",
        "active_ai_pipelines": len(active_processors),
        "computed_neural_load": f"{len(active_processors) * 8}%" if active_processors else "0%"
    }

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for ping/pong or client closing
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

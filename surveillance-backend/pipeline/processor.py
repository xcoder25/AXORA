import cv2
import time
import json
import threading
import logging
from typing import Dict, Any, Optional
import redis
from config import settings

# Attempt to import YOLO, gracefully fallback to mock if imports/weights fail
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AIProcessor")

class StreamAIProcessor(threading.Thread):
    """
    Background worker thread that captures frames from a camera stream (via go2rtc),
    runs person detection using YOLOv8/OpenCV, and publishes real-time telemetry to Redis.
    """
    
    def __init__(self, camera_id: str, stream_url: str, school_id: str = "DEFAULT_SCHOOL"):
        super().__init__()
        self.camera_id = camera_id
        self.stream_url = stream_url
        self.school_id = school_id
        self.running = False
        
        # Redis connection
        try:
            self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None

        # Load YOLO model
        self.model = None
        if YOLO_AVAILABLE:
            try:
                # Load tiny model for low-latency CPU edge inference
                self.model = YOLO(settings.YOLO_MODEL_PATH)
                logger.info(f"YOLOv8 model '{settings.YOLO_MODEL_PATH}' loaded successfully.")
            except Exception as e:
                logger.warning(f"Could not load YOLOv8 model weights: {e}. Falling back to simulation.")
        else:
            logger.warning("YOLO library not available. Falling back to simulation.")

    def stop(self):
        self.running = False

    def run(self):
        self.running = True
        logger.info(f"Starting AI Pipeline for Camera {self.camera_id} on {self.stream_url}")
        
        reconnect_delay = 1.0
        while self.running:
            cap = cv2.VideoCapture(self.stream_url)
            if not cap.isOpened():
                logger.warning(f"Stream {self.stream_url} could not be opened. Retrying in {reconnect_delay}s...")
                time.sleep(reconnect_delay)
                reconnect_delay = min(reconnect_delay * 2, 30.0) # Exp backoff
                continue
            
            reconnect_delay = 1.0 # Reset delay on successful connect
            logger.info(f"Stream connection established for Camera {self.camera_id}")
            
            frame_count = 0
            while self.running and cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    logger.warning(f"Failed to grab frame from {self.camera_id}. Reconnecting...")
                    break
                
                # Perform AI processing every 3 frames (approx. 10 FPS for 30 FPS stream)
                # to minimize CPU/GPU compute load on edge gateways
                frame_count += 1
                if frame_count % 3 != 0:
                    continue
                
                # Resize frame to optimize processing speed
                frame_resized = cv2.resize(frame, (640, 480))
                
                detected_entities = []
                
                if self.model:
                    try:
                        # Run YOLO prediction - class 0 is 'person' in COCO dataset
                        results = self.model.predict(frame_resized, classes=[0], verbose=False, conf=settings.CONFIDENCE_THRESHOLD)
                        for r in results:
                            boxes = r.boxes
                            for box in boxes:
                                b = box.xyxy[0].tolist() # get box coordinates (top-left, bottom-right)
                                c = box.cls.tolist()[0]
                                conf = float(box.conf.tolist()[0])
                                
                                detected_entities.append({
                                    "box": [int(x) for x in b],
                                    "confidence": conf,
                                    "label": "person"
                                })
                    except Exception as e:
                        logger.error(f"YOLO inference error: {e}")
                else:
                    # Simulated detection layer (creates realistic periodic detections for testing)
                    import random
                    # Generate a person entry every few seconds for demonstration
                    sec = time.time()
                    if int(sec) % 8 in [0, 1, 2]:
                        detected_entities.append({
                            "box": [random.randint(50, 200), random.randint(100, 300), random.randint(300, 450), random.randint(350, 480)],
                            "confidence": round(random.uniform(0.78, 0.95), 2),
                            "label": "person"
                        })
                
                # Send telemetry update to Redis Pub/Sub
                if self.redis_client:
                    payload = {
                        "camera_id": self.camera_id,
                        "school_id": self.school_id,
                        "timestamp": time.time(),
                        "detections": detected_entities,
                        "total_detected": len(detected_entities)
                    }
                    try:
                        self.redis_client.publish("surveillance_events", json.dumps(payload))
                        
                        # Write to mock Firestore / local attendance logs if individuals are recognized
                        # If a person is present, trigger the attendance log event
                        if len(detected_entities) > 0:
                            # Attendance event logging
                            attendance_event = {
                                "camera_id": self.camera_id,
                                "school_id": self.school_id,
                                "detected_count": len(detected_entities),
                                "event": "person_detected",
                                "timestamp": time.time()
                            }
                            self.redis_client.publish("attendance_events", json.dumps(attendance_event))
                    except Exception as e:
                        logger.error(f"Redis publish error: {e}")
                
                # Sleep briefly to regulate pipeline execution rate
                time.sleep(0.05)
                
            cap.release()
            
        logger.info(f"AI Pipeline for Camera {self.camera_id} stopped.")

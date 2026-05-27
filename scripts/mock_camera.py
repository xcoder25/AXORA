import time
import json
import redis
import subprocess
import os

def run_ffmpeg_mock_stream():
    """
    Spins up an ffmpeg subprocess to generate a test pattern (H.264 video + sound)
    and pushes it to go2rtc at rtsp://localhost:8554/mock_source.
    This simulates a real live IP camera streaming RTSP on the local network.
    """
    print("[MockCamera] Checking for ffmpeg...")
    # Check if ffmpeg is installed
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        ffmpeg_installed = True
    except FileNotFoundError:
        ffmpeg_installed = False
        print("[MockCamera] ffmpeg not found in PATH. Ffmpeg RTSP simulation will be skipped.")
        print("[MockCamera] TIP: Install ffmpeg or run go2rtc's built-in mock stream tests.")
        
    if ffmpeg_installed:
        # Command to stream a high-fidelity bouncing ball test pattern via RTSP
        command = [
            "ffmpeg",
            "-re",
            "-f", "lavfi",
            "-i", "testsrc=size=640x480:rate=30",
            "-vcodec", "libx264",
            "-preset", "veryfast",
            "-f", "rtsp",
            "rtsp://localhost:8554/mock_source"
        ]
        print(f"[MockCamera] Starting ffmpeg RTSP mock stream: {' '.join(command)}")
        try:
            return subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            print(f"[MockCamera] Could not launch ffmpeg process: {e}")
    return None

def run_redis_telemetry_simulator():
    """
    Connects to Redis and publishes simulated YOLO person detection events.
    This allows verification of the WebSocket and frontend HUD overlay layers
    even when go2rtc/OpenCV aren't fully running.
    """
    print("[MockCamera] Connecting to Redis event broker...")
    try:
        r = redis.from_url("redis://localhost:6379/0", decode_responses=True)
        r.ping()
        print("[MockCamera] Connected to Redis! Simulating real-time AI detections...")
    except Exception as e:
        print(f"[MockCamera] Redis not reachable: {e}. AI simulation skipped.")
        return

    # Simulate periodic person detections moving across the screen
    x = 100
    y = 150
    direction_x = 10
    direction_y = 5
    
    try:
        while True:
            # Update coordinate simulation
            x += direction_x
            y += direction_y
            if x < 50 or x > 400: direction_x *= -1
            if y < 80 or y > 300: direction_y *= -1
            
            # Send detection payload
            detections = [
                {
                    "box": [x, y, x + 120, y + 200],
                    "confidence": 0.89,
                    "label": "person"
                }
            ]
            
            payload = {
                "camera_id": "CAM-01",
                "school_id": "DEFAULT_SCHOOL",
                "timestamp": time.time(),
                "detections": detections,
                "total_detected": len(detections)
            }
            
            r.publish("surveillance_events", json.dumps(payload))
            print(f"[MockCamera] Broadcast simulated detection: bounding box [{x}, {y}, {x+120}, {y+200}]")
            time.sleep(1.0)
            
    except KeyboardInterrupt:
        print("[MockCamera] AI simulation stopped.")

if __name__ == "__main__":
    print("=" * 60)
    print(" AXORA SURVEILLANCE LAYER: TESTING & VERIFICATION SUITE")
    print("=" * 60)
    
    # Launch ffmpeg RTSP stream in background
    ffmpeg_proc = run_ffmpeg_mock_stream()
    
    # Start Redis AI Telemetry events simulation
    try:
        run_redis_telemetry_simulator()
    finally:
        if ffmpeg_proc:
            print("[MockCamera] Stopping ffmpeg RTSP stream process...")
            ffmpeg_proc.terminate()
            ffmpeg_proc.wait()
        print("[MockCamera] Cleanup complete.")

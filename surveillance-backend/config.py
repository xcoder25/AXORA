import os
from dotenv import load_dotenv

# Load local .env if it exists
load_dotenv()

class Settings:
    # Service settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # go2rtc Stream Gateway URL
    GO2RTC_URL: str = os.getenv("GO2RTC_URL", "http://localhost:1984")
    
    # Firebase credentials
    # Can be a path to serviceAccountKey.json or direct env string of JSON
    FIREBASE_CREDENTIALS: str = os.getenv("FIREBASE_CREDENTIALS", "")
    
    # AI/YOLO configurations
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", 0.5))

settings = Settings()

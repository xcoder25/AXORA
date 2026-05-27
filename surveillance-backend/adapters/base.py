from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class CameraAdapter(ABC):
    """
    Abstract Base Class for all Camera Adapters.
    Normalizes camera configurations, RTSP URL generations, PTZ controls, and firmware quirks.
    """
    
    def __init__(self, ip: str, port: int, username: str, password: str, extra_config: Optional[Dict[str, Any]] = None):
        self.ip = ip
        self.port = port
        self.username = username
        self.password = password
        self.extra_config = extra_config or {}
        
    @abstractmethod
    def get_rtsp_url(self, channel: int = 1, profile: str = "main") -> str:
        """
        Generates the vendor-specific RTSP streaming URL.
        """
        pass
        
    @abstractmethod
    def ptz_control(self, pan: float, tilt: float, zoom: float) -> bool:
        """
        Performs PTZ relative / continuous movement.
        Values between -1.0 and 1.0.
        """
        pass
        
    @abstractmethod
    def trigger_preset(self, preset_id: str) -> bool:
        """
        Moves camera to a predefined preset position.
        """
        pass
        
    @abstractmethod
    def probe(self) -> Dict[str, Any]:
        """
        Probes the camera connection, checks auth, and returns device info.
        Returns:
            Dict containing {"status": "online/offline", "model": str, "firmware": str, "capabilities": list}
        """
        pass
        
    @abstractmethod
    def subscribe_events(self, webhook_url: str) -> bool:
        """
        Subscribes to camera motion/tamper events using ONVIF / HTTP notifications.
        """
        pass

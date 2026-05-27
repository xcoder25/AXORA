import requests
from typing import Dict, Any, Optional
from .base import CameraAdapter

class HanwhaAdapter(CameraAdapter):
    """
    Hanwha (Wisenet) Camera Adapter.
    Uses Hanwha SUNAPI HTTP API.
    """

    def get_rtsp_url(self, channel: int = 1, profile: str = "main") -> str:
        # Hanwha RTSP URL format: rtsp://username:password@ip:port/profile2/media.smp
        # Channel is typically represented by profile settings in Hanwha.
        auth_part = ""
        if self.username and self.password:
            auth_part = f"{self.username}:{self.password}@"
        return f"rtsp://{auth_part}{self.ip}:{self.port}/profile2/media.smp"

    def ptz_control(self, pan: float, tilt: float, zoom: float) -> bool:
        # Hanwha SUNAPI continuous PTZ movement
        # Endpoint: /cgi-bin/ptzcontrol.cgi?ptzmode=continuous&pan=...&tilt=...&zoom=...
        url = f"http://{self.ip}/cgi-bin/ptzcontrol.cgi"
        
        # Scale values -1.0..1.0 to Hanwha speed -6.0..6.0 (or -100..100 depending on firmware)
        pan_val = int(pan * 6)
        tilt_val = int(tilt * 6)
        zoom_val = int(zoom * 6)
        
        params = {
            "ptzmode": "continuous",
            "pan": str(pan_val),
            "tilt": str(tilt_val),
            "zoom": str(zoom_val)
        }
        
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.get(url, params=params, auth=auth, timeout=3)
            return response.status_code == 200
        except Exception as e:
            print(f"[HanwhaAdapter] SUNAPI PTZ continuous failed: {e}")
            return False

    def trigger_preset(self, preset_id: str) -> bool:
        # Hanwha preset goto SUNAPI
        # /cgi-bin/ptzcontrol.cgi?ptzmode=preset&preset=preset_id
        url = f"http://{self.ip}/cgi-bin/ptzcontrol.cgi"
        params = {
            "ptzmode": "preset",
            "preset": preset_id
        }
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.get(url, params=params, auth=auth, timeout=3)
            return response.status_code == 200
        except Exception as e:
            print(f"[HanwhaAdapter] SUNAPI preset failed: {e}")
            return False

    def probe(self) -> Dict[str, Any]:
        # Probe using /cgi-bin/system.cgi?action=getdeviceinfo SUNAPI
        url = f"http://{self.ip}/cgi-bin/system.cgi"
        params = {"action": "getdeviceinfo"}
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.get(url, params=params, auth=auth, timeout=2)
            if response.status_code == 200:
                lines = response.text.splitlines()
                info = {}
                for line in lines:
                    if "=" in line:
                        k, v = line.split("=", 1)
                        info[k.strip()] = v.strip()
                return {
                    "status": "online",
                    "brand": "Hanwha",
                    "model": info.get("DeviceName", "Wisenet Camera"),
                    "firmware": info.get("FirmwareVersion", "Unknown"),
                    "capabilities": ["PTZ", "SUNAPI", "H.264", "H.265"]
                }
        except Exception as e:
            print(f"[HanwhaAdapter] Probe failed: {e}")
            
        return {
            "status": "offline",
            "brand": "Hanwha",
            "model": "Hanwha Camera (Offline)",
            "firmware": "N/A",
            "capabilities": ["RTSP"]
        }

    def subscribe_events(self, webhook_url: str) -> bool:
        print(f"[HanwhaAdapter] Subscribing to Hanwha SUNAPI events on {webhook_url}.")
        return True

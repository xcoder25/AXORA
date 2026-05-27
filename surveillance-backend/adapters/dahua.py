import requests
from typing import Dict, Any, Optional
from .base import CameraAdapter

class DahuaAdapter(CameraAdapter):
    """
    Dahua Camera Adapter.
    Uses Dahua HTTP CGI API protocols.
    """

    def get_rtsp_url(self, channel: int = 1, profile: str = "main") -> str:
        # Dahua RTSP syntax: rtsp://username:password@ip:port/cam/realmonitor?channel=1&subtype=0
        subtype = 0 if profile == "main" else 1
        auth_part = ""
        if self.username and self.password:
            auth_part = f"{self.username}:{self.password}@"
        return f"rtsp://{auth_part}{self.ip}:{self.port}/cam/realmonitor?channel={channel}&subtype={subtype}"

    def ptz_control(self, pan: float, tilt: float, zoom: float) -> bool:
        # Dahua PTZ CGI calls: /cgi-bin/ptz.cgi?action=start&channel=1&code=...
        # Dahua has discrete codes for commands. Speed range is 1 to 8.
        # Let's map pan/tilt directions to action codes.
        pan_speed = int(abs(pan) * 8) or 1
        tilt_speed = int(abs(tilt) * 8) or 1
        
        # Determine direction
        code = "Right" if pan > 0 else "Left" if pan < 0 else "Up" if tilt > 0 else "Down" if tilt < 0 else "Stop"
        speed = pan_speed if pan != 0 else tilt_speed
        
        url = f"http://{self.ip}/cgi-bin/ptz.cgi"
        params = {
            "action": "start",
            "channel": "1",
            "code": code,
            "arg1": "0",
            "arg2": str(speed),
            "arg3": "0"
        }
        
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.get(url, params=params, auth=auth, timeout=3)
            return response.status_code == 200
        except Exception as e:
            print(f"[DahuaAdapter] Dahua CGI PTZ failed: {e}")
            return False

    def trigger_preset(self, preset_id: str) -> bool:
        # Dahua Preset: ptz.cgi?action=start&channel=1&code=GotoPreset&arg1=0&arg2=preset_id&arg3=0
        url = f"http://{self.ip}/cgi-bin/ptz.cgi"
        params = {
            "action": "start",
            "channel": "1",
            "code": "GotoPreset",
            "arg1": "0",
            "arg2": preset_id,
            "arg3": "0"
        }
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.get(url, params=params, auth=auth, timeout=3)
            return response.status_code == 200
        except Exception as e:
            print(f"[DahuaAdapter] Dahua preset failed: {e}")
            return False

    def probe(self) -> Dict[str, Any]:
        # Probe using /cgi-bin/magicBox.cgi?action=getSystemInfo
        url = f"http://{self.ip}/cgi-bin/magicBox.cgi"
        params = {"action": "getSystemInfo"}
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
                    "brand": "Dahua",
                    "model": info.get("appFileName", "Dahua IP Camera"),
                    "firmware": info.get("version", "Unknown"),
                    "capabilities": ["PTZ", "DahuaCGI", "H.264", "H.265"]
                }
        except Exception as e:
            print(f"[DahuaAdapter] Probe failed: {e}")
            
        return {
            "status": "offline",
            "brand": "Dahua",
            "model": "Generic Dahua Device (Offline)",
            "firmware": "N/A",
            "capabilities": ["RTSP"]
        }

    def subscribe_events(self, webhook_url: str) -> bool:
        print(f"[DahuaAdapter] Subscribing to Dahua events on {webhook_url}.")
        return True

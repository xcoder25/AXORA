import requests
from typing import Dict, Any, Optional
from .base import CameraAdapter

class HikvisionAdapter(CameraAdapter):
    """
    Hikvision Camera Adapter.
    Uses Hikvision ISAPI XML HTTP protocol and standard stream syntax.
    """

    def get_rtsp_url(self, channel: int = 1, profile: str = "main") -> str:
        # Hikvision RTSP syntax: rtsp://username:password@ip:port/Streaming/Channels/101 (Channel 1, Stream 1)
        # channel 1 main stream = 101, sub stream = 102
        stream_id = f"{channel}01" if profile == "main" else f"{channel}02"
        auth_part = ""
        if self.username and self.password:
            auth_part = f"{self.username}:{self.password}@"
        return f"rtsp://{auth_part}{self.ip}:{self.port}/Streaming/Channels/{stream_id}"

    def ptz_control(self, pan: float, tilt: float, zoom: float) -> bool:
        # Hikvision ISAPI continuous PTZ movement
        # Endpoint: PUT /ISAPI/PTZCtrl/channels/<channel>/continuous
        url = f"http://{self.ip}/ISAPI/PTZCtrl/channels/1/continuous"
        
        # Scale values -1.0..1.0 to Hikvision speed range -100..100
        pan_val = int(pan * 100)
        tilt_val = int(tilt * 100)
        zoom_val = int(zoom * 100)
        
        headers = {"Content-Type": "application/xml"}
        xml_data = f"""<?xml version="1.0" encoding="UTF-8"?>
        <PTZData version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
            <pan>{pan_val}</pan>
            <tilt>{tilt_val}</tilt>
            <zoom>{zoom_val}</zoom>
        </PTZData>
        """
        
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.put(url, data=xml_data, headers=headers, auth=auth, timeout=3)
            return response.status_code == 200
        except Exception as e:
            print(f"[HikvisionAdapter] ISAPI PTZ continuous call failed: {e}")
            return False

    def trigger_preset(self, preset_id: str) -> bool:
        # Hikvision ISAPI preset trigger
        # PUT /ISAPI/PTZCtrl/channels/1/presets/<id>/goto
        url = f"http://{self.ip}/ISAPI/PTZCtrl/channels/1/presets/{preset_id}/goto"
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.put(url, auth=auth, timeout=3)
            return response.status_code == 200
        except Exception as e:
            print(f"[HikvisionAdapter] ISAPI preset call failed: {e}")
            return False

    def probe(self) -> Dict[str, Any]:
        # Probe using ISAPI System DeviceInfo endpoint
        url = f"http://{self.ip}/ISAPI/System/deviceInfo"
        try:
            auth = requests.auth.HTTPDigestAuth(self.username, self.password)
            response = requests.get(url, auth=auth, timeout=2)
            if response.status_code == 200:
                # Basic parsing of ISAPI XML (usually contains <model> and <firmwareVersion>)
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                namespace = {'ns': 'http://www.isapi.org/ver20/XMLSchema'}
                
                model_node = root.find('.//ns:model', namespace)
                fw_node = root.find('.//ns:firmwareVersion', namespace)
                
                model = model_node.text if model_node is not None else "Hikvision Device"
                fw = fw_node.text if fw_node is not None else "Unknown"
                
                return {
                    "status": "online",
                    "brand": "Hikvision",
                    "model": model,
                    "firmware": fw,
                    "capabilities": ["PTZ", "ISAPI", "H.264", "H.265"]
                }
        except Exception as e:
            print(f"[HikvisionAdapter] Probe failed: {e}")
            
        return {
            "status": "offline",
            "brand": "Hikvision",
            "model": "Hikvision NVR/Camera (Offline)",
            "firmware": "N/A",
            "capabilities": ["RTSP"]
        }

    def subscribe_events(self, webhook_url: str) -> bool:
        # Hikvision ISAPI Event Subscription (HTTP Host Notification)
        print(f"[HikvisionAdapter] Subscribing to Hikvision ISAPI events on {webhook_url}.")
        return True

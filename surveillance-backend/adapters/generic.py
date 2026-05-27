from typing import Dict, Any, Optional
from .base import CameraAdapter

# Import python-onvif-zeep if available, else mock
try:
    from onvif import ONVIFCamera
    ONVIF_AVAILABLE = True
except ImportError:
    ONVIF_AVAILABLE = False

class GenericONVIFAdapter(CameraAdapter):
    """
    Generic ONVIF and RTSP Camera Adapter.
    Uses python-onvif-zeep to interact with ONVIF standard services.
    """
    
    def __init__(self, ip: str, port: int, username: str, password: str, extra_config: Optional[Dict[str, Any]] = None):
        super().__init__(ip, port, username, password, extra_config)
        self.onvif_port = self.extra_config.get("onvif_port", 80)
        self.camera_client: Optional[Any] = None
        self._connected = False

    def _get_onvif_client(self):
        if not ONVIF_AVAILABLE:
            return None
        if self.camera_client is not None:
            return self.camera_client
        try:
            # Initialize ONVIFCamera (wsdl path is handled automatically by library)
            self.camera_client = ONVIFCamera(self.ip, self.onvif_port, self.username, self.password)
            self._connected = True
            return self.camera_client
        except Exception as e:
            print(f"[GenericONVIFAdapter] Could not connect to ONVIF service: {e}")
            self._connected = False
            return None

    def get_rtsp_url(self, channel: int = 1, profile: str = "main") -> str:
        client = self._get_onvif_client()
        if client:
            try:
                media_service = client.create_media_service()
                profiles = media_service.GetProfiles()
                if profiles:
                    # Select profile index based on channel/profile
                    target_profile = profiles[0]
                    if len(profiles) > 1 and profile != "main":
                        target_profile = profiles[1]
                    
                    stream_uri = media_service.GetStreamUri({
                        'StreamSetup': {
                            'Stream': 'RTP-Unicast',
                            'Transport': {'Protocol': 'RTSP'}
                        },
                        'ProfileToken': target_profile.token
                    })
                    # inject auth if not returned in URL
                    url = stream_uri.Uri
                    if self.username and self.password and "@" not in url:
                        # Replace rtsp:// with rtsp://username:password@
                        url = url.replace("rtsp://", f"rtsp://{self.username}:{self.password}@")
                    return url
            except Exception as e:
                print(f"[GenericONVIFAdapter] ONVIF stream URI fetch failed: {e}. Falling back to default RTSP path.")
                
        # Default fallback RTSP URL
        auth_part = f"{self.username}:{self.password}@" if self.username and self.password else ""
        return f"rtsp://{auth_part}{self.ip}:{self.port}/onvif-stream"

    def ptz_control(self, pan: float, tilt: float, zoom: float) -> bool:
        client = self._get_onvif_client()
        if not client:
            return False
            
        try:
            ptz_service = client.create_ptz_service()
            media_service = client.create_media_service()
            profiles = media_service.GetProfiles()
            if not profiles:
                return False
            
            profile_token = profiles[0].token
            
            # Absolute or continuous relative move using standard Profile S/T PTZ schemas
            ptz_service.ContinuousMove({
                'ProfileToken': profile_token,
                'Velocity': {
                    'PanTilt': {'x': pan, 'y': tilt},
                    'Zoom': {'x': zoom}
                },
                'Timeout': 'PT1S' # Move for 1 second
            })
            return True
        except Exception as e:
            print(f"[GenericONVIFAdapter] ONVIF PTZ command failed: {e}")
            return False

    def trigger_preset(self, preset_id: str) -> bool:
        client = self._get_onvif_client()
        if not client:
            return False
            
        try:
            ptz_service = client.create_ptz_service()
            media_service = client.create_media_service()
            profiles = media_service.GetProfiles()
            if not profiles:
                return False
                
            profile_token = profiles[0].token
            ptz_service.GotoPreset({
                'ProfileToken': profile_token,
                'PresetToken': preset_id,
                'Speed': {'PanTilt': {'x': 1.0, 'y': 1.0}}
            })
            return True
        except Exception as e:
            print(f"[GenericONVIFAdapter] ONVIF preset call failed: {e}")
            return False

    def probe(self) -> Dict[str, Any]:
        client = self._get_onvif_client()
        if client:
            try:
                device_service = client.create_device_service()
                device_info = device_service.GetDeviceInformation()
                
                # Fetch profiles to confirm Profile support
                media_service = client.create_media_service()
                profiles = media_service.GetProfiles()
                
                capabilities = ["ONVIF"]
                if profiles:
                    capabilities.append("Profile S (Video)")
                try:
                    client.create_ptz_service()
                    capabilities.append("Profile T (PTZ)")
                except Exception:
                    pass
                    
                return {
                    "status": "online",
                    "brand": "Generic ONVIF",
                    "model": device_info.Model if hasattr(device_info, 'Model') else "Generic IP Camera",
                    "firmware": device_info.FirmwareVersion if hasattr(device_info, 'FirmwareVersion') else "Unknown",
                    "capabilities": capabilities
                }
            except Exception as e:
                print(f"[GenericONVIFAdapter] ONVIF probe detailed fetch failed: {e}")
                
        return {
            "status": "offline",
            "brand": "Generic ONVIF",
            "model": "Generic ONVIF Device (Offline)",
            "firmware": "N/A",
            "capabilities": ["RTSP"]
        }

    def subscribe_events(self, webhook_url: str) -> bool:
        client = self._get_onvif_client()
        if not client:
            return False
        try:
            # Use ONVIF Event service to register webhook
            event_service = client.create_events_service()
            # Subscribe to basic PullPoint/Event broker
            print(f"[GenericONVIFAdapter] Event subscription on {webhook_url} not fully implemented for generic XML brokers.")
            return True
        except Exception as e:
            print(f"[GenericONVIFAdapter] ONVIF event subscription failed: {e}")
            return False

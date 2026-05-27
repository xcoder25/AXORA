export type CameraProtocol =
  | 'mock'
  | 'hikvision'
  | 'dvr'
  | 'ip-cam'
  | 'onvif'
  | 'rtsp';

export type CameraStreamRequest = {
  schoolId?: string;
  nodeId: string;
  protocol?: CameraProtocol;
};

/**
 * Camera bridge (UI-facing):
 * - Right now this returns a mocked stream URL.
 * - Later, we will swap this implementation to call a backend transcoder
 *   (RTSP/Hikvision/ONVIF -> WebRTC/HLS) and return the real playable URL.
 */
export function resolveCameraStreamUrl({
  nodeId,
  protocol = 'mock',
}: CameraStreamRequest): string {
  // If the node uses live RTSP/ONVIF streaming, route it to our go2rtc Stream Gateway
  if (protocol === 'rtsp' || protocol === 'onvif' || protocol === 'hikvision') {
    // go2rtc WebRTC websocket source
    return `ws://localhost:1984/api/ws?src=${encodeURIComponent(nodeId)}`;
  }
  
  // FastAPI live snapshot route
  if (protocol === 'ip-cam') {
    return `http://localhost:8000/api/cameras/${encodeURIComponent(nodeId)}/snapshot`;
  }

  // Placeholder stream for mock testing
  const seed = `${nodeId}:${protocol}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
}


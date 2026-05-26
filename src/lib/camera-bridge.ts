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
  // Placeholder stream while backend transcoder is not wired.
  // Use encodeURIComponent so node IDs are safe in URLs.
  const seed = `${nodeId}:${protocol}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
}


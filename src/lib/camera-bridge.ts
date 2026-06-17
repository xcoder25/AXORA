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
 * Resolved base URLs from environment variables.
 *
 * NEXT_PUBLIC_SURVEILLANCE_API_URL  → Cloud Run FastAPI backend
 *   e.g. https://axora-765938782391.europe-west1.run.app
 *
 * NEXT_PUBLIC_GO2RTC_URL            → go2rtc WebRTC gateway (on-prem / self-hosted)
 *   e.g. http://YOUR_GO2RTC_IP:1984   (cannot be Cloud Run — needs direct network access)
 *
 * Both fall back to localhost for local development.
 */
const SURVEILLANCE_API =
  process.env.NEXT_PUBLIC_SURVEILLANCE_API_URL?.replace(/\/$/, '') ??
  'https://axora-765938782391.europe-west1.run.app';

const GO2RTC_URL =
  process.env.NEXT_PUBLIC_GO2RTC_URL?.replace(/\/$/, '') ??
  'http://localhost:1984';

/**
 * Camera bridge (UI-facing):
 * Resolves a camera node to a playable stream or snapshot URL.
 * For RTSP/ONVIF/Hikvision streams: routes to go2rtc WebRTC websocket.
 * For IP-cam snapshot polling:      routes to FastAPI /api/cameras/{id}/snapshot.
 * For mock/dvr:                     returns a stable placeholder image.
 */
export function resolveCameraStreamUrl({
  nodeId,
  protocol = 'mock',
}: CameraStreamRequest): string {
  // RTSP / ONVIF / Hikvision → go2rtc WebRTC WebSocket (must be accessible from browser)
  if (protocol === 'rtsp' || protocol === 'onvif' || protocol === 'hikvision') {
    const wsBase = GO2RTC_URL.replace(/^http/, 'ws');
    return `${wsBase}/api/ws?src=${encodeURIComponent(nodeId)}`;
  }

  // IP-cam → FastAPI snapshot endpoint on Cloud Run
  if (protocol === 'ip-cam') {
    return `${SURVEILLANCE_API}/api/cameras/${encodeURIComponent(nodeId)}/snapshot`;
  }

  // Placeholder stream for mock / DVR testing
  const seed = `${nodeId}:${protocol}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
}

/**
 * Returns the base URL for direct REST calls to the surveillance backend.
 * Use this for camera CRUD, health checks, PTZ, etc.
 */
export const surveillanceApiUrl = SURVEILLANCE_API;

/**
 * Returns the WebSocket URL for AI event telemetry from the backend.
 * Connect to this to receive real-time YOLO detection events.
 */
export function getSurveillanceWsUrl(): string {
  const wsBase = SURVEILLANCE_API.replace(/^http/, 'ws');
  return `${wsBase}/ws/events`;
}

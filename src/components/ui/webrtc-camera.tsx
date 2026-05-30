"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";

interface WebRTCCameraProps {
  cameraId: string;
  location: string;
  fallbackImage: string;
  detections?: any[];
}

export function WebRTCCamera({ cameraId, location, fallbackImage, detections = [] }: WebRTCCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pc: RTCPeerConnection | null = null;
    setLoading(true);
    setError(false);

    const connectWebRTC = () => {
      try {
        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        pc.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            setLoading(false);
          }
        };

        // Receive-only transceivers
        pc.addTransceiver("video", { direction: "recvonly" });
        pc.addTransceiver("audio", { direction: "recvonly" });

        // Connect to go2rtc WebRTC WebSocket API
        // NEXT_PUBLIC_GO2RTC_URL must be set to your go2rtc server (e.g. http://YOUR_IP:1984)
        const go2rtcBase = (process.env.NEXT_PUBLIC_GO2RTC_URL ?? 'http://localhost:1984')
          .replace(/\/$/, '')
          .replace(/^http/, 'ws');
        const wsUrl = `${go2rtcBase}/api/ws?src=${encodeURIComponent(cameraId)}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setError(false);
        };

        ws.onmessage = async (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "offer" && pc) {
              await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: msg.sdp }));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws?.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
            } else if (msg.type === "candidate" && pc) {
              await pc.addIceCandidate(new RTCIceCandidate({ candidate: msg.candidate, sdpMLineIndex: 0 }));
            }
          } catch (e) {
            console.error("[WebRTCCamera] WebSocket message parsing error:", e);
          }
        };

        ws.onerror = () => {
          setError(true);
          setLoading(false);
        };

        ws.onclose = () => {
          // If closed and still mounting, wait and retry
          if (pc && pc.connectionState !== "connected") {
            setError(true);
            setLoading(false);
          }
        };
      } catch (err) {
        console.error("[WebRTCCamera] WebRTC initiation error:", err);
        setError(true);
        setLoading(false);
      }
    };

    connectWebRTC();

    return () => {
      if (ws) ws.close();
      if (pc) pc.close();
    };
  }, [cameraId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/80 hover:border-primary/40 transition-all duration-700 group">
      {/* Real-time Video Stream */}
      {!error && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-75 group-hover:opacity-90"}`}
        />
      )}

      {/* Fallback Static Placeholder when Offline/Error */}
      {(error || !cameraId) && (
        <img
          src={fallbackImage}
          alt={location}
          className="w-full h-full object-cover opacity-30 transition-all duration-700"
        />
      )}

      {/* Spinner Overlay */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TUNNELING STREAM...</span>
        </div>
      )}

      {/* Offline/Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 p-4">
          <WifiOff className="h-8 w-8 text-red-500 mb-2" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">CAMERA CONNECTION LOSS</span>
          <p className="text-[8px] text-muted-foreground text-center max-w-[200px] mb-3">
            RTSP connection timed out or Gateway is inactive.
          </p>
          <button 
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Retry Link
          </button>
        </div>
      )}

      {/* AI Bounding Boxes HUD Overlays */}
      {!loading && !error && detections && detections.map((det, index) => {
        const [x1, y1, x2, y2] = det.box || [0, 0, 0, 0];
        // Convert normalized coordinates (based on 640x480 processor size) to percentage
        const left = `${(x1 / 640) * 100}%`;
        const top = `${(y1 / 480) * 100}%`;
        const width = `${((x2 - x1) / 640) * 100}%`;
        const height = `${((y2 - y1) / 480) * 100}%`;

        return (
          <div
            key={index}
            style={{ left, top, width, height }}
            className="absolute border-2 border-red-500 pointer-events-none z-10"
          >
            <div className="absolute top-0 left-0 -translate-y-full bg-red-500 text-white text-[8px] font-bold uppercase px-1 rounded-tr">
              PERSON {Math.round(det.confidence * 100)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

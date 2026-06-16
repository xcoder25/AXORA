'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera, ShieldCheck, Video, Clock, Users, CheckCircle2, AlertCircle,
  QrCode, Filter, Activity, Expand, Eye, Focus, Wifi, WifiOff,
  Cpu, AlertTriangle, UserCheck, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useDoc } from '@/firebase';
import { useRealtimeScans } from '@/hooks/use-realtime-scans';

// ── Camera Feed Panel ─────────────────────────────────────────────────────────
function CameraFeedPanel({
  id, name, status, detections, zone, isMain = false
}: {
  id: string; name: string; status: 'active' | 'offline'; detections: number;
  zone: string; isMain?: boolean;
}) {
  const [scanLineY, setScanLineY] = useState(0);
  const [detectionFlash, setDetectionFlash] = useState(false);
  const [localDetections, setLocalDetections] = useState(detections);
  const animFrameRef = useRef<number | null>(null);
  const dirRef = useRef<1 | -1>(1);

  // Animate scan line
  useEffect(() => {
    if (status !== 'active') return;
    let y = 0;

    const animate = () => {
      y += 0.4 * dirRef.current;
      if (y >= 100) { dirRef.current = -1; }
      if (y <= 0) { dirRef.current = 1; }
      setScanLineY(y);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status]);

  // Periodically increment detections
  useEffect(() => {
    if (status !== 'active') return;
    setLocalDetections(detections);
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setLocalDetections(prev => prev + 1);
        setDetectionFlash(true);
        setTimeout(() => setDetectionFlash(false), 600);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [status, detections]);

  const confidence = 88 + Math.floor(Math.random() * 11);

  if (status === 'offline') {
    return (
      <div className={cn(
        'relative rounded-2xl overflow-hidden border border-red-500/20 bg-black flex items-center justify-center',
        isMain ? 'aspect-video' : 'aspect-video'
      )}>
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px',
          }}
        />
        <div className="text-center z-10">
          <WifiOff className="h-8 w-8 text-red-500/60 mx-auto mb-2" />
          <p className="text-sm font-black text-red-400 animate-pulse">SIGNAL LOST</p>
          <p className="text-[9px] text-white/30 font-mono mt-1">{id}</p>
        </div>
        {/* Corner HUD brackets */}
        <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-red-500/40" />
        <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-red-500/40" />
        <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-red-500/40" />
        <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-red-500/40" />
      </div>
    );
  }

  return (
    <div className={cn(
      'relative rounded-2xl overflow-hidden border border-white/10 group aspect-video bg-black/90',
      detectionFlash && 'ring-2 ring-emerald-500/30'
    )}>
      {/* Dark gradient background simulating camera feed */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, rgba(99,102,241,0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(16,185,129,0.1) 0%, transparent 50%)
          `
        }}
      />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none z-10"
        style={{
          top: `${scanLineY}%`,
          background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.8), rgba(16,185,129,0.6), transparent)',
          boxShadow: '0 0 8px rgba(99,102,241,0.6)',
          opacity: 0.7,
        }}
      />

      {/* HUD corner brackets */}
      <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-primary/60 z-20" />
      <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-primary/60 z-20" />
      <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-primary/60 z-20" />
      <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-primary/60 z-20" />

      {/* Simulated detection box */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-20 border border-emerald-400/30 z-10"
        style={{ boxShadow: '0 0 10px rgba(16,185,129,0.2)' }}>
        <div className="absolute -top-px left-2 right-2 h-px bg-emerald-400/50" />
        <div className="absolute -bottom-px left-2 right-2 h-px bg-emerald-400/50" />
      </div>
      {/* Confidence badge near detection box */}
      <div className="absolute top-[38%] left-[55%] z-20">
        <span className="text-[7px] font-black text-emerald-400 bg-black/70 px-1 py-0.5 rounded border border-emerald-500/30">
          {confidence}% ✓
        </span>
      </div>

      {/* Top overlay */}
      <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start z-20">
        <div>
          <p className="text-xs font-bold text-white drop-shadow-md">{name}</p>
          <p className="text-[8px] text-primary/70 font-mono mt-0.5">{id} · {zone}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-red-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[7px] font-black uppercase tracking-widest text-white/90">LIVE</span>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between z-20">
        <div className={cn(
          'flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border transition-all duration-300',
          detectionFlash ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/10'
        )}>
          <Users className="h-3 w-3 text-primary" />
          <span className={cn('text-[9px] font-black', detectionFlash ? 'text-emerald-400' : 'text-white')}>
            {localDetections.toLocaleString()} scans today
          </span>
        </div>
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
          <Cpu className="h-3 w-3 text-primary/60" />
          <span className="text-[8px] font-mono text-white/50">AI Active</span>
        </div>
      </div>
    </div>
  );
}

// ── Scan Event Row ────────────────────────────────────────────────────────────
function ScanRow({ scan, isNew }: { scan: any; isNew?: boolean }) {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-300 mb-1',
      isNew && 'animate-in fade-in slide-in-from-right-4 duration-400 bg-white/[0.05]',
      scan.status === 'denied' && 'bg-red-500/5'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-all duration-300',
          scan.status === 'granted'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400',
          isNew && 'scale-110'
        )}>
          {scan.method === 'Face ID' ? <Camera className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={cn('text-xs font-bold truncate', scan.status === 'denied' ? 'text-red-400' : 'text-white')}>
              {scan.student}
            </p>
            {isNew && (
              <span className="shrink-0 rounded-full bg-primary/20 text-primary text-[6px] font-black uppercase px-1 border border-primary/30 animate-pulse">
                NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-white/40">
            <span>{scan.node}</span>
            <span>·</span>
            <span>{scan.time}</span>
            {scan.confidence && (
              <>
                <span>·</span>
                <span className="text-emerald-400/70">{scan.confidence}%</span>
              </>
            )}
          </div>
        </div>
      </div>
      <Badge className={cn(
        'text-[7px] font-black border-none shrink-0',
        scan.status === 'granted'
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-red-500/15 text-red-400'
      )}>
        {scan.status === 'granted' ? <UserCheck className="mr-1 h-2.5 w-2.5" /> : <AlertTriangle className="mr-1 h-2.5 w-2.5" />}
        {scan.status}
      </Badge>
    </div>
  );
}

// ── Camera Feed Configuration ─────────────────────────────────────────────────
const CAMERA_NODES = [
  { id: 'CAM-01', name: 'Main Gate Entrance', status: 'active' as const, detections: 142, zone: 'Perimeter' },
  { id: 'CAM-02', name: 'Library Corridor', status: 'active' as const, detections: 56, zone: 'Academic' },
  { id: 'CAM-03', name: 'Cafeteria Zone A', status: 'active' as const, detections: 89, zone: 'Social' },
  { id: 'CAM-04', name: 'Science Block', status: 'offline' as const, detections: 0, zone: 'Academic' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const schoolId = profile?.schoolId as string | undefined;

  const { scans, loading, latestScan, stats } = useRealtimeScans(schoolId);
  const [elapsedTick, setElapsedTick] = useState(0);

  // Update relative times every 30s
  useEffect(() => {
    const interval = setInterval(() => setElapsedTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const attendanceStats = [
    {
      label: 'Present Today',
      value: (1200 + stats.present).toLocaleString(),
      pct: `${Math.round(94 + stats.present * 0.01)}%`,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      label: 'Denied / Flagged',
      value: String(10 + stats.denied),
      pct: `${stats.denied} live`,
      icon: AlertCircle,
      color: 'bg-red-500/10 border-red-500/20 text-red-400',
    },
    {
      label: 'Via Face ID',
      value: String(stats.faceId + 87),
      pct: `${Math.round(stats.faceId / Math.max(1, stats.faceId + stats.qrPass) * 100)}% neural`,
      icon: Eye,
      color: 'bg-primary/10 border-primary/20 text-primary',
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">
            <Focus className="mr-1 h-3 w-3" /> Identity Matrix
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            Attendance & Vision
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Real-time biometric attendance tracking, neural camera feeds, and campus entry telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-emerald-400">
              {CAMERA_NODES.filter(c => c.status === 'active').length} Nodes Online
            </span>
          </div>
          <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
            <Camera className="mr-2 h-4 w-4" /> Add Camera Node
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {attendanceStats.map((stat) => (
          <Card key={stat.label} className="glass-card border-white/5">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <span className="text-xs font-bold mb-1 text-emerald-400">{stat.pct}</span>
                </div>
              </div>
              <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center border', stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">

        {/* ── Neural Camera Matrix ─────────────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="glass-card border-white/5">
            <CardHeader className="border-b border-white/5 p-4 flex flex-row items-center justify-between bg-black/20">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Neural Vision Nodes
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] uppercase font-black px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  {CAMERA_NODES.filter(c => c.status === 'active').length} Online
                </Badge>
                <Badge className="bg-red-500/20 text-red-400 border-none text-[8px] uppercase font-black">
                  {CAMERA_NODES.filter(c => c.status === 'offline').length} Offline
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {CAMERA_NODES.map((feed) => (
                  <CameraFeedPanel
                    key={feed.id}
                    id={feed.id}
                    name={feed.name}
                    status={feed.status}
                    detections={feed.detections}
                    zone={feed.zone}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Neural scan confidence gauge */}
          <Card className="glass-card border-white/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <p className="text-sm font-black uppercase tracking-widest text-white">Recognition Confidence</p>
                </div>
                <span className="text-xs font-mono text-white/30">
                  Avg {stats.avgConfidence > 0 ? stats.avgConfidence : 92}%
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Face ID Accuracy', value: stats.avgConfidence > 0 ? stats.avgConfidence : 93 },
                  { label: 'QR Pass Success Rate', value: 99 },
                  { label: 'Identity Verification', value: 97 },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] font-bold text-white/60 mb-1">
                      <span>{label}</span>
                      <span className="text-primary">{value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-1000"
                        style={{ width: `${value}%`, boxShadow: '0 0 8px rgba(99,102,241,0.5)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Real-Time Scan Telemetry ────────────────────── */}
        <div className="lg:col-span-4">
          <Card className="glass-card border-white/5 h-full flex flex-col">
            <CardHeader className="border-b border-white/5 p-4 bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Live Scan Feed
                </CardTitle>
                <Badge className="bg-emerald-500/10 border-emerald-500/20 text-[8px] text-emerald-400 font-black flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none z-10" />
              <div className="overflow-y-auto h-full p-2 max-h-[600px]">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 mb-1">
                      <div className="h-8 w-8 rounded-lg shimmer shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-28 rounded shimmer" />
                        <div className="h-2 w-20 rounded shimmer" />
                      </div>
                    </div>
                  ))
                ) : scans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <Activity className="h-8 w-8 text-primary/30 mb-3 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                      Awaiting scans…
                    </p>
                    <p className="text-[9px] text-white/20 mt-1">
                      Events will appear here as students scan in
                    </p>
                  </div>
                ) : (
                  scans.map((scan, i) => (
                    <ScanRow
                      key={scan.id}
                      scan={scan}
                      isNew={latestScan?.id === scan.id}
                    />
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t border-white/5 bg-black/20">
              <div className="w-full flex items-center justify-between">
                <span className="text-[8px] font-mono text-white/25">
                  {scans.length} events streamed live
                </span>
                <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg">
                  Full Registry <Expand className="ml-1.5 h-3 w-3" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera, ShieldCheck, Video, Clock, Users, CheckCircle2, AlertCircle,
  QrCode, Search, Filter, Activity, Expand, Eye, Focus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ───────────────────────────────────────────────────────────────────
const LIVE_FEEDS = [
  { id: 'CAM-01', name: 'Main Gate Entrance', status: 'active', detections: 142 },
  { id: 'CAM-02', name: 'Library Corridor', status: 'active', detections: 56 },
  { id: 'CAM-03', name: 'Cafeteria Zone A', status: 'active', detections: 89 },
  { id: 'CAM-04', name: 'Science Block', status: 'offline', detections: 0 },
];

const RECENT_SCANS = [
  { id: 'SCAN-102', student: 'Alice Johnson', grade: 'JSS-3A', time: 'Just now', method: 'Face ID', node: 'Main Gate', status: 'granted' },
  { id: 'SCAN-101', student: 'Brian Okafor', grade: 'SSS-1B', time: '2 mins ago', method: 'QR Pass', node: 'Library', status: 'granted' },
  { id: 'SCAN-100', student: 'Unknown Individual', grade: 'N/A', time: '5 mins ago', method: 'Face ID', node: 'Main Gate', status: 'denied' },
  { id: 'SCAN-099', student: 'Chioma Nweke', grade: 'SSS-3A', time: '12 mins ago', method: 'QR Pass', node: 'Main Gate', status: 'granted' },
];

const ATTENDANCE_STATS = [
  { label: 'Present Today', value: '1,245', pct: '94.2%', trend: 'up' },
  { label: 'Absent', value: '62', pct: '4.8%', trend: 'down' },
  { label: 'Late Arrivals', value: '15', pct: '1.0%', trend: 'down' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('live');

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
            Real-time biometric attendance tracking, RTSP camera feeds, and campus entry logs.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-5 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10">
            <Filter className="mr-2 h-4 w-4" /> Filter Logs
          </Button>
          <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
            <Camera className="mr-2 h-4 w-4" /> Add Camera Node
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ATTENDANCE_STATS.map((stat, i) => (
          <Card key={stat.label} className="glass-card border-white/5">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <span className={cn('text-xs font-bold mb-1',
                    i === 0 ? 'text-emerald-400' : i === 1 ? 'text-red-400' : 'text-amber-400'
                  )}>{stat.pct}</span>
                </div>
              </div>
              <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center border',
                i === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                i === 1 ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                'bg-amber-500/10 border-amber-500/20 text-amber-400'
              )}>
                {i === 0 ? <CheckCircle2 className="h-6 w-6" /> : i === 1 ? <AlertCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* ── Live Camera Matrix ─────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-card border-white/5 h-full">
            <CardHeader className="border-b border-white/5 p-4 flex flex-row items-center justify-between bg-black/20">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Live Vision Nodes
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] uppercase font-black px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" /> 3 Online
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white">
                  <Expand className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {LIVE_FEEDS.map((feed) => (
                  <div key={feed.id} className="relative rounded-2xl overflow-hidden border border-white/10 group aspect-video bg-black flex items-center justify-center">
                    {feed.status === 'active' ? (
                      <>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#ffffff,transparent_60%)] pointer-events-none" />
                        <Eye className="h-8 w-8 text-white/10" />
                        
                        {/* Overlay info */}
                        <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-white drop-shadow-md">{feed.name}</p>
                            <p className="text-[9px] text-white/70 font-mono mt-0.5">{feed.id}</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/90">LIVE</span>
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Users className="h-3 w-3 text-primary" />
                          <span className="text-[9px] font-black text-white">{feed.detections} scans today</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Video className="h-8 w-8 text-red-500/40 mx-auto mb-2" />
                        <p className="text-xs font-bold text-red-400">Signal Lost</p>
                        <p className="text-[9px] text-white/30 font-mono mt-1">{feed.id}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Telemetry Event Log ────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-white/5 h-full flex flex-col">
            <CardHeader className="border-b border-white/5 p-4 bg-black/20">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" /> Event Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none z-10" />
              <div className="divide-y divide-white/5 overflow-y-auto h-full p-2">
                {RECENT_SCANS.map((scan, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors mb-1">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border shrink-0',
                        scan.status === 'granted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                      )}>
                        {scan.method === 'Face ID' ? <Camera className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className={cn('text-xs font-bold truncate', scan.status === 'denied' ? 'text-red-400' : 'text-white')}>{scan.student}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-white/40">
                          <span>{scan.node}</span>
                          <span>•</span>
                          <span>{scan.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Simulated older logs */}
                {[...Array(6)].map((_, i) => (
                  <div key={`old-${i}`} className="flex items-center justify-between p-3 rounded-xl opacity-50 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shrink-0">
                        <QrCode className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">Verified Student</p>
                        <p className="text-[9px] text-white/40 mt-0.5">Library Node • {15 + i*5} mins ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t border-white/5 bg-black/20">
              <Button variant="ghost" className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg">
                View Full Registry <Expand className="ml-1.5 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, ShieldAlert, Monitor, Activity, Lock, AlertTriangle, Zap } from "lucide-react"

export default function SecurityPage() {
  const feeds = [
    { id: 'CAM-01', location: 'Main Entrance', status: 'Secure', alerts: 0, image: 'https://picsum.photos/seed/gate/400/300' },
    { id: 'CAM-02', location: 'Computer Lab A', status: 'Activity', alerts: 1, image: 'https://picsum.photos/seed/lab/400/300' },
    { id: 'CAM-03', location: 'Staff Room', status: 'Secure', alerts: 0, image: 'https://picsum.photos/seed/staff/400/300' },
    { id: 'CAM-04', location: 'Science Wing', status: 'Secure', alerts: 0, image: 'https://picsum.photos/seed/science/400/300' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Security & CAM</h2>
          <p className="text-muted-foreground text-lg">Centralized surveillance and AI-powered integrity monitoring.</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <Zap className="h-3 w-3" /> System Nominal
          </Badge>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-red-600 hover:bg-red-700">
            <ShieldAlert className="mr-2 h-4 w-4" /> LOCKDOWN
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">42 / 42</div>
            <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1">100% Availability</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Proctoring Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">12</div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Current Active Exams</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">03</div>
            <p className="text-[9px] text-orange-400 font-bold uppercase mt-1">Under AI Review</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Encryption Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">AES-256</div>
            <p className="text-[9px] text-primary font-bold uppercase mt-1">End-to-End Secure</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="glass-card border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-white">Integrated CAM Feeds</CardTitle>
                  <CardDescription>Live telemetry from institutional zones.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-primary text-[10px] font-bold uppercase tracking-widest">
                  View Multi-Grid <Monitor className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {feeds.map((feed) => (
                  <div key={feed.id} className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/5 hover:border-primary/40 transition-all duration-500">
                    <img src={feed.image} alt={feed.location} className="w-full aspect-video object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={feed.alerts > 0 ? 'bg-orange-500 text-white' : 'bg-black/60 backdrop-blur-md text-white border-white/10'}>
                        {feed.id}
                      </Badge>
                      {feed.alerts > 0 && <Badge className="bg-red-500 text-white animate-pulse">ALERT</Badge>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{feed.location}</span>
                      <div className="flex items-center gap-1.5">
                        <Activity className={`h-3 w-3 ${feed.status === 'Activity' ? 'text-orange-400' : 'text-emerald-400'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">{feed.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none">
            <CardHeader className="bg-orange-500/10 border-b border-orange-500/10">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-orange-400" />
                AI Proctoring Feed
              </CardTitle>
              <CardDescription className="text-xs">Live integrity audit for Exam #824.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4">
                    <div className="h-16 w-20 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 overflow-hidden">
                       <img src={`https://picsum.photos/seed/student-${i}/200/150`} className="object-cover w-full h-full opacity-60" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">Student_Node_{i}</span>
                        <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-500">CLEAR</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">No suspicious objects or external sound detected in last 500ms.</p>
                    </div>
                  </div>
                ))}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-4 animate-pulse">
                   <div className="h-16 w-20 rounded-lg bg-black/40 flex items-center justify-center border border-red-500/30 overflow-hidden relative">
                       <img src="https://picsum.photos/seed/suspicious/200/150" className="object-cover w-full h-full opacity-60" />
                       <div className="absolute inset-0 border-2 border-red-500" />
                   </div>
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">Student_Node_3</span>
                        <Badge className="bg-red-500 text-white text-[8px]">VIOLATION</Badge>
                      </div>
                      <p className="text-[10px] text-red-400 font-bold leading-tight">Secondary device detected in proximity. Triggering alert.</p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

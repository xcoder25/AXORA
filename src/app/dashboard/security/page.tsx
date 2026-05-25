
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Video, 
  ShieldAlert, 
  Monitor, 
  Activity, 
  Lock, 
  AlertTriangle, 
  Zap, 
  Plus, 
  Wifi, 
  Server, 
  Settings, 
  Loader2, 
  CheckCircle2, 
  Radio,
  Cpu
} from "lucide-react"

export default function SecurityPage() {
  const [integrating, setIntegrating] = useState(false)
  const [activeTab, setActiveTab] = useState<'monitor' | 'devices'>('monitor')

  const hardwareNodes = [
    { id: 'NVR-HK-01', name: 'Main Hikvision Hub', type: 'NVR', protocol: 'HikConnect', status: 'Online', load: '12%' },
    { id: 'DVR-GEN-02', name: 'Perimeter DVR', type: 'DVR', protocol: 'RTSP', status: 'Online', load: '45%' },
    { id: 'WIFI-IP-03', name: 'Science Wing IP', type: 'Camera', protocol: 'ONVIF', status: 'Warning', load: 'N/A' },
  ];

  const cameraFeeds = [
    { id: 'CAM-01', location: 'Main Entrance', status: 'Secure', alerts: 0, image: 'https://picsum.photos/seed/gate/400/300' },
    { id: 'CAM-02', location: 'Computer Lab A', status: 'Activity', alerts: 1, image: 'https://picsum.photos/seed/lab/400/300' },
    { id: 'CAM-03', location: 'Staff Room', status: 'Secure', alerts: 0, image: 'https://picsum.photos/seed/staff/400/300' },
    { id: 'CAM-04', location: 'Science Wing', status: 'Secure', alerts: 0, image: 'https://picsum.photos/seed/science/400/300' },
  ];

  const handleIntegrate = () => {
    setIntegrating(true)
    setTimeout(() => setIntegrating(false), 2000)
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[9px] font-bold">
              Institutional Security Node
            </Badge>
            <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Security Command</h2>
          <p className="text-muted-foreground text-lg">Integrated Hikvision, DVR, and Wireless Telemetry Hub.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5" onClick={() => setActiveTab(activeTab === 'monitor' ? 'devices' : 'monitor')}>
            <Settings className="mr-2 h-4 w-4" /> 
            {activeTab === 'monitor' ? 'Hardware Config' : 'Live Monitor'}
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px]">
            <ShieldAlert className="mr-2 h-4 w-4" /> TRIGGER LOCKDOWN
          </Button>
        </div>
      </div>

      {activeTab === 'monitor' ? (
        <>
          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">42 / 42</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <p className="text-[9px] text-emerald-400 font-bold uppercase">100% Signal Stability</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hardware Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">04</div>
                <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">NVR/DVR Hubs Online</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-orange-400">AI Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400">03</div>
                <p className="text-[9px] text-orange-400 font-bold uppercase mt-1">Anomalies Detected</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Network Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">8.4 Gbps</div>
                <p className="text-[9px] text-primary font-bold uppercase mt-1">Encrypted Tunnel Active</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Live Feed Grid */}
            <div className="lg:col-span-8">
              <Card className="glass-card border-none overflow-hidden h-full">
                <CardHeader className="bg-white/3 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">Unified Telemetry Feed</CardTitle>
                      <CardDescription className="text-xs">Real-time H.265/ONVIF Optimized Streams.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary text-[10px] font-bold uppercase tracking-widest h-8 px-4 rounded-lg bg-primary/10">
                      Multi-Grid View <Monitor className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {cameraFeeds.map((feed) => (
                      <div key={feed.id} className="group relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 hover:border-primary/40 transition-all duration-700">
                        <img src={feed.image} alt={feed.location} className="w-full aspect-video object-cover opacity-50 group-hover:opacity-70 transition-all duration-700 scale-100 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        
                        {/* HUD Overlay */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                          <div className="flex justify-between items-start">
                             <div className="flex gap-2">
                                <Badge className={feed.alerts > 0 ? 'bg-orange-500 text-white' : 'bg-black/60 backdrop-blur-md text-white border-white/10 text-[8px]'}>
                                  {feed.id}
                                </Badge>
                                {feed.alerts > 0 && <Badge className="bg-red-500 text-white animate-pulse text-[8px]">AI_FLAG</Badge>}
                             </div>
                             <div className="h-4 w-4 border-t border-r border-white/40" />
                          </div>
                          
                          <div className="flex items-end justify-between">
                             <div className="h-4 w-4 border-b border-l border-white/40" />
                             <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
                                <Activity className={`h-3 w-3 ${feed.status === 'Activity' ? 'text-orange-400' : 'text-emerald-400'}`} />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-white">{feed.status}</span>
                             </div>
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-3 text-[10px] font-bold text-white/90 drop-shadow-lg uppercase tracking-wider">
                          {feed.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Proctoring / Integrity Audit */}
            <div className="lg:col-span-4">
              <Card className="glass-card border-none h-full shadow-2xl">
                <CardHeader className="bg-primary/10 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Neural Proctor Node</span>
                  </div>
                  <CardTitle className="text-xl text-white">Integrity Audit</CardTitle>
                  <CardDescription className="text-xs">Live violation monitoring for Exam_A82.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-4 animate-in fade-in slide-in-from-right-4">
                       <div className="h-16 w-20 rounded-lg bg-black/40 flex items-center justify-center border border-red-500/30 overflow-hidden relative group">
                           <img src="https://picsum.photos/seed/suspicious/200/150" className="object-cover w-full h-full opacity-60 group-hover:opacity-80 transition-opacity" />
                           <div className="absolute inset-0 border-2 border-red-500 animate-pulse" />
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Student_Node_3</span>
                            <Badge className="bg-red-500 text-white text-[8px] h-4">ALERT</Badge>
                          </div>
                          <p className="text-[10px] text-red-400 font-bold leading-tight">Mobile device proximity detected.</p>
                          <Button variant="ghost" className="h-5 p-0 text-[8px] font-bold uppercase tracking-widest text-red-500 hover:bg-transparent">Review Clip</Button>
                       </div>
                    </div>

                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 hover:bg-white/8 transition-colors">
                        <div className="h-16 w-20 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 overflow-hidden">
                           <img src={`https://picsum.photos/seed/student-${i}/200/150`} className="object-cover w-full h-full opacity-40" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Student_Node_{i}</span>
                            <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-500 h-4 uppercase">Nominal</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-tight">Biometric posture stable. No suspicious audio.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                   <Button variant="outline" className="w-full h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5">
                     Full Integrity Report
                   </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* Hardware Configuration View */
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-4">
              <Card className="glass-card border-none">
                <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Secure Integration</span>
                  </div>
                  <CardTitle className="text-xl text-white">Link Device</CardTitle>
                  <CardDescription className="text-xs">Authenticate Hikvision, DVR, or IP hardware.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Integration Type</Label>
                      <Select defaultValue="hikvision">
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                          <SelectValue placeholder="Select Device Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hikvision">Hikvision NVR/DVR</SelectItem>
                          <SelectItem value="dvr">Generic DVR Hub</SelectItem>
                          <SelectItem value="ip-cam">Wireless IP Camera</SelectItem>
                          <SelectItem value="onvif">ONVIF Compliant Device</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">IP / Hostname</Label>
                        <Input placeholder="192.168.1.10" className="bg-white/5 border-white/10 rounded-xl h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Service Port</Label>
                        <Input placeholder="8000" className="bg-white/5 border-white/10 rounded-xl h-11" />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Access Token / Password</Label>
                      <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 rounded-xl h-11" />
                   </div>
                   <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Radio className="h-3 w-3 text-primary animate-pulse" />
                        <span className="text-[9px] font-bold text-white uppercase">Real-time Tunneling Mode</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-relaxed">
                        Establishing a P2P tunnel for HikConnect or RTSP fallback if NAT is restricted.
                      </p>
                   </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                   <Button className="w-full h-12 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" onClick={handleIntegrate} disabled={integrating}>
                      {integrating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ESTABLISHING LINK...</> : <><Plus className="mr-2 h-4 w-4" /> INITIATE CONNECTION</>}
                   </Button>
                </CardFooter>
              </Card>
           </div>

           <div className="lg:col-span-8">
              <Card className="glass-card border-none">
                <CardHeader className="bg-white/3 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">Institutional Node Matrix</CardTitle>
                      <CardDescription className="text-xs">Managing local and remote security hardware clusters.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="grid gap-4">
                      {hardwareNodes.map((node) => (
                        <div key={node.id} className="flex items-center justify-between p-5 bg-white/3 border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                                 {node.type === 'NVR' ? <Server className="h-6 w-6 text-primary" /> : node.type === 'DVR' ? <Zap className="h-6 w-6 text-orange-400" /> : <Wifi className="h-6 w-6 text-blue-400" />}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-white">{node.name}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[8px] font-bold border-white/10 text-muted-foreground uppercase">{node.protocol}</Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono">{node.id}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                              <div className="text-right hidden sm:block">
                                 <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Compute Load</p>
                                 <p className="text-xs font-bold text-white">{node.load}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                 <Badge className={node.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}>
                                    {node.status}
                                 </Badge>
                                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Update 200ms ago</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
              </Card>
           </div>
        </div>
      )}
    </div>
  )
}

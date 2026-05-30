"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WebRTCCamera } from "@/components/ui/webrtc-camera"
import { surveillanceApiUrl, getSurveillanceWsUrl } from "@/lib/camera-bridge"
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
  Cpu,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from "lucide-react"

export default function SecurityPage() {
  const [integrating, setIntegrating] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [activeTab, setActiveTab] = useState<'monitor' | 'devices'>('monitor')
  const [cameras, setCameras] = useState<any[]>([])
  const [discoveryResults, setDiscoveryResults] = useState<any[]>([])
  const [detections, setDetections] = useState<Record<string, any[]>>({})
  const [activeCamId, setActiveCamId] = useState<string>("CAM-01")
  const [health, setHealth] = useState<any>({
    redis: "Checking...",
    go2rtc: "Checking...",
    active_ai_pipelines: 0,
    computed_neural_load: "0%"
  })

  // Link form states
  const [linkId, setLinkId] = useState("")
  const [linkName, setLinkName] = useState("")
  const [linkBrand, setLinkBrand] = useState("hikvision")
  const [linkIp, setLinkIp] = useState("")
  const [linkPort, setLinkPort] = useState("554")
  const [linkUser, setLinkUser] = useState("")
  const [linkPass, setLinkPass] = useState("")

  // Fetch registered cameras and health status
  const fetchCameras = async () => {
    try {
      const res = await fetch(`${surveillanceApiUrl}/api/cameras`)
      if (res.ok) {
        const data = await res.json()
        setCameras(data)
        if (data.length > 0 && !activeCamId) {
          setActiveCamId(data[0].id)
        }
      }
    } catch (e) {
      console.warn("Failed to fetch cameras database from backend:", e)
      // Standard static fallback if service isn't running yet
      setCameras([
        { id: 'CAM-01', name: 'Main Entrance', brand: 'Hikvision', ip: '192.168.1.64', status: 'Online', rtsp_url: '' },
        { id: 'CAM-02', name: 'Computer Lab A', brand: 'Axis', ip: '192.168.1.88', status: 'Online', rtsp_url: '' },
        { id: 'CAM-03', name: 'Staff Room', brand: 'Generic', ip: '192.168.1.110', status: 'Online', rtsp_url: '' },
        { id: 'CAM-04', name: 'Science Wing', brand: 'Hanwha', ip: '192.168.1.120', status: 'Online', rtsp_url: '' },
      ])
    }
  }

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${surveillanceApiUrl}/api/cameras/health`)
      if (res.ok) {
        const data = await res.json()
        setHealth(data)
      }
    } catch (e) {
      setHealth({
        redis: "Disconnected",
        go2rtc: "Disconnected",
        active_ai_pipelines: 0,
        computed_neural_load: "Offline"
      })
    }
  }

  useEffect(() => {
    fetchCameras()
    fetchHealth()
    
    // Poll health status
    const interval = setInterval(() => {
      fetchHealth()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Listen to AI event WebSockets
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connectWS = () => {
      try {
        ws = new WebSocket(getSurveillanceWsUrl())
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.camera_id) {
              setDetections(prev => ({
                ...prev,
                [data.camera_id]: data.detections || []
              }))
            }
          } catch (e) {
            // ignore
          }
        }
        
        ws.onclose = () => {
          // Retry connection after 5 seconds
          setTimeout(connectWS, 5000)
        }
      } catch (err) {
        console.warn("Could not link to real-time events WebSocket stream:", err)
      }
    }

    connectWS()
    return () => {
      if (ws) ws.close()
    }
  }, [])

  // PTZ continuous / relative triggers
  const executePTZ = async (pan: number, tilt: number, zoom: number) => {
    try {
      await fetch(`${surveillanceApiUrl}/api/cameras/${activeCamId}/ptz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan, tilt, zoom })
      })
    } catch (e) {
      console.error("PTZ fetch error:", e)
    }
  }

  // WS-Discovery scan
  const handleScan = async () => {
    setScanning(true)
    try {
      const res = await fetch(`${surveillanceApiUrl}/api/cameras/discovery`)
      if (res.ok) {
        const data = await res.json()
        setDiscoveryResults(data)
      }
    } catch (e) {
      console.error("WS-Discovery scan failed:", e)
    } finally {
      setScanning(false)
    }
  }

  // Camera integration linking
  const handleIntegrate = async () => {
    if (!linkId || !linkName || !linkIp) return
    
    setIntegrating(true)
    try {
      const payload = {
        id: linkId,
        name: linkName,
        brand: linkBrand,
        ip: linkIp,
        port: parseInt(linkPort),
        username: linkUser,
        password: linkPass
      }
      
      const res = await fetch(`${surveillanceApiUrl}/api/cameras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        await fetchCameras()
        setLinkId("")
        setLinkName("")
        setLinkIp("")
        setLinkUser("")
        setLinkPass("")
        setActiveTab("monitor")
      }
    } catch (e) {
      console.error("Failed to link camera:", e)
    } finally {
      setIntegrating(false)
    }
  }

  const handleAutoFill = (device: any) => {
    setLinkId(`CAM-${device.ip.split('.').pop()}`)
    setLinkName(`Discovery (${device.ip})`)
    setLinkIp(device.ip)
    setLinkBrand("generic")
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
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]">Security Command</h2>
          <p className="text-muted-foreground text-lg">Integrated Axis, Hikvision, Dahua, and ONVIF Telemetry Hub.</p>
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
                <div className="text-3xl font-bold text-white">{cameras.length} / {cameras.length}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <p className="text-[9px] text-emerald-400 font-bold uppercase">100% Signal Stability</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stream Gateway</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{health.go2rtc === "Connected" ? "go2rtc" : "Mock"}</div>
                <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">
                  Gateway: {health.go2rtc}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Redis Broker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400">{health.redis}</div>
                <p className="text-[9px] text-orange-400 font-bold uppercase mt-1">Event Broker Link Status</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Computed Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{health.computed_neural_load}</div>
                <p className="text-[9px] text-primary font-bold uppercase mt-1">Active pipelines: {health.active_ai_pipelines}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Live Feed Grid */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="glass-card border-none overflow-hidden">
                <CardHeader className="bg-white/3 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">Unified Telemetry Feed</CardTitle>
                      <CardDescription className="text-xs">Real-time WebRTC/MSE Optimized Camera Grid.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {cameras.map((cam) => (
                      <div 
                        key={cam.id} 
                        onClick={() => setActiveCamId(cam.id)}
                        className={`relative cursor-pointer rounded-2xl overflow-hidden border transition-all ${
                          activeCamId === cam.id ? "border-primary ring-2 ring-primary/20" : "border-white/5"
                        }`}
                      >
                        <WebRTCCamera 
                          cameraId={cam.id}
                          location={cam.name}
                          fallbackImage={`https://picsum.photos/seed/${cam.id}/400/300`}
                          detections={detections[cam.id] || []}
                        />
                        
                        {/* HUD overlays */}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-white pointer-events-none uppercase">
                          {cam.id} | {cam.brand}
                        </div>
                        <div className="absolute bottom-3 left-3 text-[10px] font-bold text-white drop-shadow-md pointer-events-none uppercase">
                          {cam.name} ({cam.ip})
                        </div>
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold pointer-events-none uppercase text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* PTZ Joystick Controller overlay (integrated) */}
              <Card className="glass-card border-none overflow-hidden">
                <CardHeader className="bg-white/3 border-b border-white/5">
                  <CardTitle className="text-sm text-white uppercase tracking-wider">PTZ Camera Control: {activeCamId}</CardTitle>
                  <CardDescription className="text-xs">Send physical pan/tilt speed commands to active node.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* Directional Pad */}
                  <div className="relative w-36 h-36 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="absolute top-1 hover:bg-white/10 h-8 w-8 rounded-full" onClick={() => executePTZ(0.0, 0.5, 0.0)}>
                      <ChevronUp className="h-4 w-4 text-white" />
                    </Button>
                    <Button variant="ghost" size="icon" className="absolute bottom-1 hover:bg-white/10 h-8 w-8 rounded-full" onClick={() => executePTZ(0.0, -0.5, 0.0)}>
                      <ChevronDown className="h-4 w-4 text-white" />
                    </Button>
                    <Button variant="ghost" size="icon" className="absolute left-1 hover:bg-white/10 h-8 w-8 rounded-full" onClick={() => executePTZ(-0.5, 0.0, 0.0)}>
                      <ChevronLeft className="h-4 w-4 text-white" />
                    </Button>
                    <Button variant="ghost" size="icon" className="absolute right-1 hover:bg-white/10 h-8 w-8 rounded-full" onClick={() => executePTZ(0.5, 0.0, 0.0)}>
                      <ChevronRight className="h-4 w-4 text-white" />
                    </Button>
                    
                    {/* Central Stop button */}
                    <Button 
                      className="h-12 w-12 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-[9px] font-bold text-red-400"
                      onClick={() => executePTZ(0.0, 0.0, 0.0)}
                    >
                      STOP
                    </Button>
                  </div>

                  {/* Zoom controls */}
                  <div className="flex gap-4 sm:flex-col">
                    <Button variant="outline" className="flex items-center gap-2 rounded-xl border-white/10 bg-white/5" onClick={() => executePTZ(0.0, 0.0, 0.5)}>
                      <ZoomIn className="h-4 w-4" /> Zoom In
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 rounded-xl border-white/10 bg-white/5" onClick={() => executePTZ(0.0, 0.0, -0.5)}>
                      <ZoomOut className="h-4 w-4" /> Zoom Out
                    </Button>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2 max-w-xs justify-center">
                    {["Preset 1", "Preset 2", "Preset 3"].map((preset, i) => (
                      <Button 
                        key={i} 
                        variant="ghost" 
                        className="text-[9px] font-mono border border-white/10 rounded-xl px-3 py-1 bg-white/3 hover:bg-white/5"
                        onClick={async () => {
                          try {
                            await fetch(`${surveillanceApiUrl}/api/cameras/${activeCamId}/ptz`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ preset_id: String(i + 1) })
                            })
                          } catch (e) {}
                        }}
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Proctoring / Neural Log */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="glass-card border-none h-full shadow-2xl">
                <CardHeader className="bg-primary/10 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Neural Proctor Node</span>
                  </div>
                  <CardTitle className="text-xl text-white">Integrity Audit</CardTitle>
                  <CardDescription className="text-xs">Live YOLO person detection alerts from registered streams.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Dynamic AI event tracking alerts */}
                    {Object.entries(detections).some(([_, det]) => det.length > 0) ? (
                      Object.entries(detections).map(([camId, det]) => {
                        if (det.length === 0) return null;
                        const cam = cameras.find(c => c.id === camId) || { name: camId };
                        return (
                          <div key={camId} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-4 animate-in fade-in slide-in-from-right-4">
                            <div className="h-16 w-20 rounded-lg bg-black/40 flex items-center justify-center border border-orange-500/30 overflow-hidden relative group">
                              <img src={`https://picsum.photos/seed/${camId}/200/150`} className="object-cover w-full h-full opacity-60" />
                              <div className="absolute inset-0 border-2 border-orange-500 animate-pulse" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{cam.name}</span>
                                <Badge className="bg-orange-500 text-white text-[8px] h-4">ALERT</Badge>
                              </div>
                              <p className="text-[10px] text-orange-400 font-bold leading-tight">
                                Detected: {det.length} Person(s)
                              </p>
                              <p className="text-[8px] text-muted-foreground">Confidence: {Math.round(det[0].confidence * 100)}%</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border border-white/5 rounded-2xl bg-white/3">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ALL NODES NOMINAL</span>
                        <p className="text-[8px] text-muted-foreground text-center mt-1">No AI anomalies detected in active feeds.</p>
                      </div>
                    )}

                    {/* Passive logs */}
                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Biometric System Logs</h4>
                      <div className="space-y-2 h-48 overflow-y-auto pr-1">
                        {cameras.map((c, i) => (
                          <div key={i} className="flex justify-between items-center text-[9px] p-2 bg-white/3 rounded-lg border border-white/5">
                            <span className="font-mono text-white">{c.id}</span>
                            <span className="text-muted-foreground">{c.ip}</span>
                            <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] border-emerald-500/20">{c.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* Hardware Configuration View */
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Link Device form */}
           <div className="lg:col-span-4">
              <Card className="glass-card border-none">
                <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Secure Integration</span>
                  </div>
                  <CardTitle className="text-xl text-white">Link Device</CardTitle>
                  <CardDescription className="text-xs">Authenticate Axis, Hikvision, Dahua, or ONVIF hardware.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Camera ID</Label>
                        <Input placeholder="CAM-01" className="bg-white/5 border-white/10 rounded-xl h-11 text-white" value={linkId} onChange={(e) => setLinkId(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Camera Name</Label>
                        <Input placeholder="Main Gate" className="bg-white/5 border-white/10 rounded-xl h-11 text-white" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">CCTV Brand Protocol</Label>
                      <Select value={linkBrand} onValueChange={(val) => setLinkBrand(val)}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                          <SelectValue placeholder="Select Brand Protocol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hikvision">Hikvision (ISAPI)</SelectItem>
                          <SelectItem value="axis">Axis (VAPIX)</SelectItem>
                          <SelectItem value="dahua">Dahua (CGI)</SelectItem>
                          <SelectItem value="hanwha">Hanwha (SUNAPI)</SelectItem>
                          <SelectItem value="generic">Generic ONVIF Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">IP Address</Label>
                        <Input placeholder="192.168.1.64" className="bg-white/5 border-white/10 rounded-xl h-11 text-white" value={linkIp} onChange={(e) => setLinkIp(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">RTSP Stream Port</Label>
                        <Input placeholder="554" className="bg-white/5 border-white/10 rounded-xl h-11 text-white" value={linkPort} onChange={(e) => setLinkPort(e.target.value)} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Auth Username</Label>
                        <Input placeholder="admin" className="bg-white/5 border-white/10 rounded-xl h-11 text-white" value={linkUser} onChange={(e) => setLinkUser(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Auth Password</Label>
                        <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 rounded-xl h-11 text-white" value={linkPass} onChange={(e) => setLinkPass(e.target.value)} />
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Radio className="h-3 w-3 text-primary animate-pulse" />
                        <span className="text-[9px] font-bold text-white uppercase">Real-time Tunneling Mode</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-relaxed">
                        Establishing dynamic stream transcoding tunnel via go2rtc and registering active pipelines.
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

           {/* WS-Discovery matrix and network device list */}
           <div className="lg:col-span-8 space-y-6">
              <Card className="glass-card border-none">
                <CardHeader className="bg-white/3 border-b border-white/5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">Network Auto-Discovery</CardTitle>
                    <CardDescription className="text-xs">Scan the local network for ONVIF-compliant IP Cameras.</CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-[9px] uppercase tracking-wider font-bold" onClick={handleScan} disabled={scanning}>
                    {scanning ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Scanning Subnet...</> : <><Search className="mr-2 h-3.5 w-3.5" /> Scan Network</>}
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                   {discoveryResults.length > 0 ? (
                      <div className="grid gap-4">
                        {discoveryResults.map((dev, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Wifi className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">IP: {dev.ip}</p>
                                <span className="text-[8px] text-muted-foreground font-mono">{dev.xaddr}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-[9px] font-bold border border-white/10 bg-white/3 text-white uppercase hover:bg-white/8 rounded-xl"
                              onClick={() => handleAutoFill(dev)}
                            >
                              Auto Link
                            </Button>
                          </div>
                        ))}
                      </div>
                   ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Activity className="h-8 w-8 text-muted-foreground/30 animate-pulse mb-2" />
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">No devices scanned yet.</p>
                        <p className="text-[10px] text-muted-foreground max-w-sm mt-1">
                          Click "Scan Network" to send a multicast WS-Discovery probe across your network.
                        </p>
                      </div>
                   )}
                </CardContent>
              </Card>

              {/* Registered nodes registry lists */}
              <Card className="glass-card border-none">
                <CardHeader className="bg-white/3 border-b border-white/5">
                  <CardTitle className="text-xl text-white">Linked Device Registry</CardTitle>
                  <CardDescription className="text-xs">Active and linked physical security hardware clusters.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="grid gap-4">
                      {cameras.map((node) => (
                        <div key={node.id} className="flex items-center justify-between p-5 bg-white/3 border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                                 <Server className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-white">{node.name}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[8px] font-bold border-white/10 text-muted-foreground uppercase">{node.brand}</Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono">{node.id} | IP: {node.ip}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <Badge className={node.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                                 {node.status}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider"
                                onClick={async () => {
                                  try {
                                    await fetch(`${surveillanceApiUrl}/api/cameras/${node.id}`, { method: "DELETE" })
                                    await fetchCameras()
                                  } catch (e) {}
                                }}
                              >
                                Delete
                              </Button>
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

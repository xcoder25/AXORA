"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Camera,
  Loader2,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Zap,
  Activity,
  Cpu,
  Eye,
  RefreshCcw,
  Video,
  VideoOff,
  Maximize2,
  Grid3X3,
  Scan,
  AlertTriangle,
  Radio,
  Moon,
  Move,
  ZoomIn,
  ZoomOut,
  Circle,
  MapPin,
  Search,
  Download,
  Play,
  Pause,
  Crosshair,
  Wifi,
  WifiOff,
} from "lucide-react"
import { recognizeAttendance } from "@/ai/flows/ai-attendance-recognition"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, query, where, orderBy, limit } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"

type CameraNode = {
  id: string
  label: string
  zone: string
  status: "online" | "degraded" | "offline"
  resolution: string
  fps: number
}

const CAMERA_NODES: CameraNode[] = [
  { id: "Camera_Node_04", label: "Entrance Gate", zone: "North Perimeter", status: "online", resolution: "4K", fps: 30 },
  { id: "Camera_Node_02", label: "Science Block", zone: "East Wing", status: "online", resolution: "1080p", fps: 25 },
  { id: "Camera_Node_09", label: "Faculty Hub", zone: "Central", status: "degraded", resolution: "1080p", fps: 20 },
  { id: "Camera_Node_11", label: "Sports Arena", zone: "South Field", status: "online", resolution: "4K", fps: 30 },
  { id: "Camera_Node_07", label: "Parking Bay", zone: "West Lot", status: "offline", resolution: "720p", fps: 0 },
  { id: "Camera_Node_01", label: "Main Hall", zone: "Atrium", status: "online", resolution: "4K", fps: 30 },
]

type LedgerFilter = "all" | "flagged" | "student" | "teacher" | "security"

export default function AttendancePage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeCam, setActiveCam] = useState(CAMERA_NODES[0].id)
  const [layout, setLayout] = useState<"single" | "grid">("single")
  const [isRecording, setIsRecording] = useState(false)
  const [autoScan, setAutoScan] = useState(false)
  const [nightVision, setNightVision] = useState(false)
  const [motionOverlay, setMotionOverlay] = useState(true)
  const [thermalMode, setThermalMode] = useState(false)
  const [zoom, setZoom] = useState([100])
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("all")
  const [ledgerSearch, setLedgerSearch] = useState("")
  const [ptzActive, setPtzActive] = useState<string | null>(null)

  const { user } = useUser()
  const db = useFirestore()
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null)

  const activeNode = CAMERA_NODES.find((n) => n.id === activeCam) ?? CAMERA_NODES[0]
  const onlineCount = CAMERA_NODES.filter((n) => n.status === "online").length

  const recentAttendanceQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null
    return query(
      collection(db, "attendance"),
      where("schoolId", "==", profile.schoolId),
      orderBy("timestamp", "desc"),
      limit(50)
    )
  }, [db, profile?.schoolId])

  const { data: recentAttendance, loading: ledgerLoading, error: ledgerError } =
    useCollection(recentAttendanceQuery)

  const handleScan = useCallback(async () => {
    if (!profile?.schoolId || activeNode.status === "offline") return
    setScanning(true)
    const placeholderImage = `https://picsum.photos/seed/${activeCam}/1200/800`

    try {
      const data = await recognizeAttendance({
        photoDataUri: placeholderImage,
        nodeId: activeCam,
      })
      setResult(data)

      if (data.identifiedEntities) {
        data.identifiedEntities.forEach((entity: any) => {
          if (entity.role !== "unknown") {
            const recordId = `${entity.id}_${Date.now()}`
            const docRef = doc(db, "attendance", recordId)
            const payload = {
              userId: entity.id,
              userName: entity.name,
              role: entity.role,
              schoolId: profile.schoolId,
              nodeId: activeCam,
              confidence: entity.confidence,
              status: entity.status,
              timestamp: serverTimestamp(),
            }

            setDoc(docRef, payload, { merge: true }).catch(() => {
              errorEmitter.emit(
                "permission-error",
                new FirestorePermissionError({
                  path: docRef.path,
                  operation: "write",
                  requestResourceData: payload,
                })
              )
            })
          }
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setScanning(false)
    }
  }, [activeCam, activeNode.status, db, profile?.schoolId])

  useEffect(() => {
    if (!autoScan || activeNode.status === "offline") return
    const interval = setInterval(() => {
      void handleScan()
    }, 12000)
    return () => clearInterval(interval)
  }, [autoScan, handleScan, activeNode.status])

  const filteredLedger = useMemo(() => {
    if (!recentAttendance) return []
    return recentAttendance.filter((entity: any) => {
      const matchesFilter =
        ledgerFilter === "all" ||
        (ledgerFilter === "flagged" && entity.status === "Flagged") ||
        entity.role === ledgerFilter
      const q = ledgerSearch.toLowerCase()
      const matchesSearch =
        !q ||
        entity.userName?.toLowerCase().includes(q) ||
        entity.nodeId?.toLowerCase().includes(q) ||
        entity.role?.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [recentAttendance, ledgerFilter, ledgerSearch])

  const stats = useMemo(() => {
    const today = recentAttendance ?? []
    const flagged = today.filter((e: any) => e.status === "Flagged").length
    const present = today.filter((e: any) => e.status === "Present").length
    const avgConfidence =
      today.length > 0
        ? today.reduce((sum: number, e: any) => sum + (e.confidence ?? 0), 0) / today.length
        : 0
    return { flagged, present, avgConfidence, total: today.length }
  }, [recentAttendance])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "teacher":
        return <Briefcase className="h-4 w-4 text-primary" />
      case "security":
        return <ShieldCheck className="h-4 w-4 text-accent" />
      default:
        return <GraduationCap className="h-4 w-4 text-blue-400" />
    }
  }

  const streamUrl = `https://picsum.photos/seed/${activeCam}/1200/800`

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-[1600px] mx-auto w-full">
      {/* Command header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-accent/15 text-accent border-accent/30 uppercase text-[9px] font-bold tracking-widest">
              <Zap className="h-3 w-3 mr-1" /> Deep Vision
            </Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30 uppercase text-[9px] font-bold tracking-widest">
              <Radio className="h-3 w-3 mr-1 animate-pulse" /> {onlineCount}/{CAMERA_NODES.length} Nodes Live
            </Badge>
            {isRecording && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/40 uppercase text-[9px] font-bold">
                <Circle className="h-2 w-2 mr-1 fill-red-500 animate-pulse" /> REC
              </Badge>
            )}
          </div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white tracking-tight">
            Identity Matrix · Camera Control
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Multi-node surveillance command center with neural identity matching, PTZ routing, and live audit ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-white/5"
            onClick={() => setLayout((l) => (l === "single" ? "grid" : "single"))}
          >
            <Grid3X3 className="mr-2 h-4 w-4" />
            {layout === "single" ? "Grid View" : "Single Feed"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-white/5"
            onClick={() => {
              setResult(null)
              setIsRecording(false)
            }}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button
            size="sm"
            className="rounded-xl shadow-lg shadow-primary/25"
            onClick={handleScan}
            disabled={scanning || activeNode.status === "offline"}
          >
            {scanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Scan className="mr-2 h-4 w-4" />
            )}
            Neural Scan
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Matches Today", value: stats.total, icon: Eye, tone: "text-primary" },
          { label: "Present", value: stats.present, icon: ShieldCheck, tone: "text-emerald-400" },
          { label: "Flagged", value: stats.flagged, icon: AlertTriangle, tone: "text-amber-400" },
          {
            label: "Avg Confidence",
            value: `${(stats.avgConfidence * 100).toFixed(0)}%`,
            icon: Activity,
            tone: "text-blue-400",
          },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card border-white/5 bg-white/[0.02]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <stat.icon className={cn("h-4 w-4", stat.tone)} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Camera wall + controls */}
        <div className="xl:col-span-8 space-y-4">
          {layout === "single" ? (
            <Card className="glass-card border-none overflow-hidden relative group">
              <div
                className={cn(
                  "relative aspect-video bg-black/40",
                  nightVision && "brightness-125 contrast-125 hue-rotate-60",
                  thermalMode && "saturate-200 hue-rotate-180"
                )}
                style={{ transform: `scale(${zoom[0] / 100})`, transformOrigin: "center center" }}
              >
                <img
                  src={streamUrl}
                  alt="Live feed"
                  className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    activeNode.status === "offline" && "opacity-30 grayscale",
                    motionOverlay && "group-hover:grayscale-0 grayscale-[0.4]"
                  )}
                />
                {activeNode.status === "offline" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center">
                      <WifiOff className="h-10 w-10 text-red-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">Node Offline</p>
                    </div>
                  </div>
                )}

                {/* HUD overlay */}
                <div className="absolute inset-0 p-4 pointer-events-none">
                  <div className="border border-primary/25 rounded-2xl w-full h-full relative">
                    <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-primary/70" />
                    <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-primary/70" />
                    <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-primary/70" />
                    <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-primary/70" />
                    <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white/20" />
                    {scanning && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                    )}
                    {result?.identifiedEntities?.map((entity: any, i: number) => (
                      <div
                        key={`${entity.id}-${i}`}
                        className="absolute border-2 border-emerald-400/60 bg-emerald-500/10 rounded-lg p-2 animate-in zoom-in-95"
                        style={{
                          left: `${12 + i * 18}%`,
                          top: `${20 + (i % 2) * 22}%`,
                          width: 140,
                          height: 180,
                        }}
                      >
                        <p className="text-[9px] font-bold text-white truncate">{entity.name}</p>
                        <p className="text-[8px] text-emerald-300 uppercase">{entity.role}</p>
                        <p className="text-[8px] font-mono text-white/60">
                          {(entity.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                  <Badge className="bg-black/70 text-white border-white/20 text-[8px]">
                    {activeNode.resolution} · {activeNode.fps} FPS
                  </Badge>
                  <Badge className="bg-black/70 text-white border-white/20 text-[8px]">
                    {activeNode.zone}
                  </Badge>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 p-3 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {activeNode.label}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-white/50">H.265 · AES-256 · NODE {activeCam.split("_")[2]}</span>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CAMERA_NODES.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveCam(node.id)}
                  className={cn(
                    "relative aspect-video rounded-xl overflow-hidden border-2 transition-all text-left",
                    activeCam === node.id ? "border-primary ring-2 ring-primary/30" : "border-white/10 opacity-80 hover:opacity-100"
                  )}
                >
                  <img
                    src={`https://picsum.photos/seed/${node.id}/400/300`}
                    alt={node.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex flex-col justify-end">
                    <p className="text-[9px] font-bold text-white truncate">{node.label}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {node.status === "online" ? (
                        <Wifi className="h-2.5 w-2.5 text-emerald-400" />
                      ) : node.status === "degraded" ? (
                        <Activity className="h-2.5 w-2.5 text-amber-400" />
                      ) : (
                        <WifiOff className="h-2.5 w-2.5 text-red-400" />
                      )}
                      <span className="text-[7px] text-white/60 uppercase">{node.status}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* PTZ + transport controls */}
          <Card className="glass-card border-white/5">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="space-y-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Transport
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={isRecording ? "destructive" : "outline"}
                      className="rounded-lg"
                      onClick={() => setIsRecording((r) => !r)}
                    >
                      {isRecording ? <VideoOff className="h-4 w-4 mr-1" /> : <Video className="h-4 w-4 mr-1" />}
                      {isRecording ? "Stop" : "Record"}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg">
                      <Maximize2 className="h-4 w-4 mr-1" /> Fullscreen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => setAutoScan((a) => !a)}
                    >
                      {autoScan ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      Auto-scan {autoScan ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <ZoomOut className="h-4 w-4 text-muted-foreground" />
                    <Slider value={zoom} onValueChange={setZoom} min={80} max={150} step={5} className="flex-1" />
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-white/50 w-10">{zoom[0]}%</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    PTZ Pad
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {["↖", "↑", "↗", "←", "⊙", "→", "↙", "↓", "↘"].map((label) => (
                      <Button
                        key={label}
                        size="icon"
                        variant="outline"
                        className={cn(
                          "h-9 w-9 rounded-lg border-white/10 bg-white/5 text-xs",
                          ptzActive === label && "bg-primary/20 border-primary"
                        )}
                        onMouseDown={() => setPtzActive(label)}
                        onMouseUp={() => setPtzActive(null)}
                        onMouseLeave={() => setPtzActive(null)}
                      >
                        {label === "⊙" ? <Move className="h-3.5 w-3.5" /> : label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Vision modes
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80 flex items-center gap-2">
                      <Moon className="h-3.5 w-3.5" /> Night vision
                    </span>
                    <Switch checked={nightVision} onCheckedChange={setNightVision} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80 flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5" /> Motion boxes
                    </span>
                    <Switch checked={motionOverlay} onCheckedChange={setMotionOverlay} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80 flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5" /> Thermal
                    </span>
                    <Switch checked={thermalMode} onCheckedChange={setThermalMode} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail: nodes + ledger */}
        <div className="xl:col-span-4 space-y-4">
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4 text-primary" /> Node Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {CAMERA_NODES.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveCam(node.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                    activeCam === node.id
                      ? "bg-primary/15 border-primary/40"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Camera className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{node.label}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{node.zone}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] shrink-0",
                      node.status === "online" && "border-emerald-500/40 text-emerald-400",
                      node.status === "degraded" && "border-amber-500/40 text-amber-400",
                      node.status === "offline" && "border-red-500/40 text-red-400"
                    )}
                  >
                    {node.status}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-none flex flex-col min-h-[420px]">
            <CardHeader className="bg-white/3 border-b border-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                      Live Ledger
                    </span>
                  </div>
                  <CardTitle className="text-lg text-white">Identity Matches</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search matches..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl bg-white/5 border-white/10 text-sm"
                />
              </div>
              <Tabs value={ledgerFilter} onValueChange={(v) => setLedgerFilter(v as LedgerFilter)}>
                <TabsList className="w-full grid grid-cols-5 h-8 bg-white/5">
                  <TabsTrigger value="all" className="text-[9px] px-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="flagged" className="text-[9px] px-1">
                    Alert
                  </TabsTrigger>
                  <TabsTrigger value="student" className="text-[9px] px-1">
                    Stu
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="text-[9px] px-1">
                    Fac
                  </TabsTrigger>
                  <TabsTrigger value="security" className="text-[9px] px-1">
                    Sec
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              {ledgerError && (
                <div className="m-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <p className="font-bold mb-1">Index required for live ledger</p>
                  <p className="text-[10px] opacity-90 mb-2">
                    Create the attendance index in Firebase (1–2 min build time).
                  </p>
                  <a
                    href="https://console.firebase.google.com/v1/r/project/mooneychat/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9tb29uZXljaGF0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9hdHRlbmRhbmNlL2luZGV4ZXMvXxABGgwKCHNjaG9vbElkEAEaDQoJdGltZXN0YW1wEAIaDAoIX19uYW1lX18QAg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-primary underline"
                  >
                    Create attendance index →
                  </a>
                </div>
              )}
              <ScrollArea className="flex-1 max-h-[380px]">
                <div className="p-4 space-y-2">
                  {filteredLedger.map((entity: any) => (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                          {getRoleIcon(entity.role)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{entity.userName}</p>
                          <p className="text-[9px] text-muted-foreground truncate">
                            {entity.nodeId?.replace("Camera_Node_", "Node ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <Badge
                          className={
                            entity.status === "Present"
                              ? "bg-emerald-500/10 text-emerald-500 text-[8px]"
                              : "bg-orange-500/10 text-orange-500 text-[8px]"
                          }
                        >
                          {entity.status}
                        </Badge>
                        <p className="text-[8px] text-white/40 font-mono mt-0.5">
                          {entity.timestamp?.toDate?.()?.toLocaleTimeString?.() ?? "—"}
                        </p>
                      </div>
                    </div>
                  ))}

                  {!ledgerLoading && filteredLedger.length === 0 && !ledgerError && (
                    <div className="py-16 text-center opacity-40">
                      <Camera className="h-10 w-10 mx-auto mb-3" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No matches yet</p>
                      <p className="text-[9px] mt-1">Run a neural scan to populate the ledger</p>
                    </div>
                  )}

                  {(ledgerLoading || scanning) && filteredLedger.length === 0 && (
                    <div className="py-16 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-3">
                        {scanning ? "Scanning feed…" : "Syncing ledger…"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {result?.summary && (
        <Card className="glass-card border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <Cpu className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Neural analysis</p>
              <p className="text-sm text-white/90 mt-0.5">{result.summary}</p>
            </div>
            <Badge variant="outline" className="border-white/20 text-[9px]">
              Load: {result.neuralLoad ?? "—"}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-[9px]">
              Detected: {result.totalDetected ?? 0}
            </Badge>
          </CardContent>
        </Card>
      )}

      <style jsx global>{`
        @keyframes scan-line {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan-line {
          animation: scan-line 2.5s infinite linear;
        }
      `}</style>
    </div>
  )
}

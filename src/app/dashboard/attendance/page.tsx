"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Sparkles, Loader2, Scan, RefreshCcw, ShieldCheck, Briefcase, GraduationCap, Zap, Activity, Cpu, Eye } from "lucide-react"
import { recognizeAttendance } from "@/ai/flows/ai-attendance-recognition"
import { useFirestore, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export default function AttendancePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeCam, setActiveCam] = useState("Camera_Node_04")
  const { user } = useUser()
  const db = useFirestore()

  const handleScan = async () => {
    setLoading(true)
    const placeholderImage = `https://picsum.photos/seed/${activeCam}/1200/800`
    
    try {
      const data = await recognizeAttendance({ 
        photoDataUri: placeholderImage,
        nodeId: activeCam
      })
      setResult(data)
      
      if (user && data.identifiedEntities) {
        data.identifiedEntities.forEach((entity: any) => {
          if (entity.role !== 'unknown') {
            const recordId = `${entity.id}_${new Date().toISOString().split('T')[0]}`
            setDoc(doc(db, 'attendance', recordId), {
              userId: entity.id,
              userName: entity.name,
              role: entity.role,
              schoolId: "INST-001",
              nodeId: activeCam,
              confidence: entity.confidence,
              timestamp: serverTimestamp()
            }, { merge: true })
          }
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return <Briefcase className="h-4 w-4 text-primary" />
      case 'security': return <ShieldCheck className="h-4 w-4 text-accent" />
      default: return <GraduationCap className="h-4 w-4 text-blue-400" />
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-5 items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
              <Zap className="h-3 w-3 text-accent animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Deep Vision Enabled</span>
            </div>
            <div className="flex h-5 items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <Cpu className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Neural Node {activeCam.split('_')[2]}</span>
            </div>
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight leading-none">Identity Matrix</h2>
          <p className="text-muted-foreground text-lg">Real-time neural inference across institutional security nodes.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5" onClick={() => setResult(null)}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Stream
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" onClick={handleScan} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            Initiate Deep Scan
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="glass-card border-none overflow-hidden relative group aspect-video">
            <img 
              src={`https://picsum.photos/seed/${activeCam}/1200/800`} 
              alt="Deep Vision Stream" 
              className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000" 
            />
            
            {/* Neural HUD Overlay */}
            <div className="absolute inset-0 p-8 pointer-events-none">
              <div className="border border-primary/20 rounded-3xl w-full h-full relative overflow-hidden backdrop-blur-[1px]">
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/60" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/60" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/60" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/60" />
                
                {/* Simulated Scanning Line */}
                {loading && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-scan" />
                )}

                {/* Inference Bounding Boxes */}
                {result?.identifiedEntities?.map((entity: any, i: number) => (
                  <div 
                    key={i}
                    className="absolute border-2 border-white/30 bg-white/5 rounded-xl flex flex-col justify-end p-3 transition-all duration-700 animate-in zoom-in-95"
                    style={{
                      left: `${15 + (i * 20)}%`,
                      top: `${25 + (i * 8)}%`,
                      width: '160px',
                      height: '240px',
                    }}
                  >
                    <div className="absolute top-0 left-0 p-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="bg-black/60 backdrop-blur-xl p-2 rounded-lg border border-white/10">
                      <p className="text-[10px] font-bold text-white uppercase truncate">{entity.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] font-black text-primary uppercase">{entity.role}</span>
                        <span className="text-[8px] font-mono text-white/50">{(entity.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-4 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Node Stream</span>
                </div>
                <select 
                  className="bg-transparent text-[10px] font-bold text-white/60 uppercase tracking-widest outline-none border-none hover:text-white transition-colors cursor-pointer"
                  value={activeCam}
                  onChange={(e) => setActiveCam(e.target.value)}
                >
                  <option value="Camera_Node_04" className="bg-[#02040a]">Node 04: Entrance</option>
                  <option value="Camera_Node_02" className="bg-[#02040a]">Node 02: Science</option>
                  <option value="Camera_Node_09" className="bg-[#02040a]">Node 09: Faculty</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-white/40">4K // H.265 // AES-256</span>
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[8px] font-black">Neural Link Active</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none h-full shadow-2xl flex flex-col">
            <CardHeader className="bg-white/3 border-b border-white/5 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Inference Matrix</span>
              </div>
              <CardTitle className="text-xl text-white">Identity Match Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              {!result && !loading ? (
                <div className="py-24 text-center opacity-30">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Awaiting Neural Data</p>
                </div>
              ) : loading ? (
                <div className="py-24 text-center space-y-6">
                  <div className="relative w-fit mx-auto">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <Zap className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary animate-pulse">Deconstructing Visual Logic...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.identifiedEntities.map((entity: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                          {getRoleIcon(entity.role)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{entity.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <Badge variant="outline" className="text-[8px] border-white/10 text-muted-foreground uppercase">{entity.role}</Badge>
                             <span className="text-[9px] text-primary font-mono font-bold">{(entity.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={entity.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}>
                        {entity.status}
                      </Badge>
                    </div>
                  ))}
                  <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                    <p className="text-[10px] font-medium italic text-muted-foreground leading-relaxed">
                      "System Verdict: {result.summary}"
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                       <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Load: {result.neuralLoad}</span>
                       <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Latency: 12ms</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {result && (
              <CardFooter className="bg-white/3 p-6 border-t border-white/5">
                <Button className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 transition-all active:scale-[0.98]">
                  Commit Identity Batch to Registry
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
        .animate-scan {
          animation: scan 3s infinite linear;
        }
      `}</style>
    </div>
  )
}

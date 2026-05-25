
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Sparkles, Loader2, UserCheck, UserX, Scan, RefreshCcw, ShieldCheck, Briefcase, GraduationCap, Zap } from "lucide-react"
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
    // Real-world scenario would use a snapshot from the selected security node
    const placeholderImage = `https://picsum.photos/seed/${activeCam}/800/600`
    
    try {
      const data = await recognizeAttendance({ 
        photoDataUri: placeholderImage,
        nodeId: activeCam
      })
      setResult(data)
      
      // Auto-sync recognized entities to Firestore (Simulated)
      if (user && data.identifiedEntities) {
        data.identifiedEntities.forEach((entity: any) => {
          if (entity.role !== 'unknown') {
            const recordId = `${entity.id}_${new Date().toISOString().split('T')[0]}`
            setDoc(doc(db, 'attendance', recordId), {
              userId: entity.id,
              userName: entity.name,
              role: entity.role,
              schoolId: "INST-001", // Should come from profile
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher': return <Badge className="bg-primary/10 text-primary border-primary/20">Faculty</Badge>
      case 'security': return <Badge className="bg-accent/10 text-accent border-accent/20">Security</Badge>
      default: return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Scholar</Badge>
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Neural Identity Engine Active</span>
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Identity & Attendance</h2>
          <p className="text-muted-foreground text-lg">Multi-entity recognition synced with Security Node Matrix.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5" onClick={() => setResult(null)}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Stream
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleScan} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scan className="mr-2 h-4 w-4" />}
            Initiate Neural Scan
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="glass-card border-none overflow-hidden relative group h-[550px]">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
            <img 
              src={`https://picsum.photos/seed/${activeCam}/1200/800`} 
              alt="Live Stream" 
              className="w-full h-full object-cover" 
            />
            
            {/* AI HUD Overlay */}
            <div className="absolute inset-0 p-8 pointer-events-none">
              <div className="border-2 border-primary/40 rounded-3xl w-full h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                
                {loading && (
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/60 shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-pulse" style={{ animation: 'scan 2.5s infinite linear' }} />
                )}

                {/* Simulated Bounding Boxes */}
                {result?.identifiedEntities?.map((entity: any, i: number) => (
                  <div 
                    key={i}
                    className="absolute border border-white/50 bg-white/5 rounded-lg flex flex-col justify-end p-2 transition-all duration-500"
                    style={{
                      left: `${20 + (i * 15)}%`,
                      top: `${30 + (i * 10)}%`,
                      width: '120px',
                      height: '160px',
                    }}
                  >
                    <div className="bg-black/60 backdrop-blur-md p-1 rounded-md text-[8px] font-bold text-white uppercase tracking-tighter">
                      {entity.name} <br/>
                      <span className="text-primary">{entity.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <select 
                  className="bg-transparent text-[10px] font-bold text-white uppercase tracking-widest outline-none border-none"
                  value={activeCam}
                  onChange={(e) => setActiveCam(e.target.value)}
                >
                  <option value="Camera_Node_04" className="bg-black">Node 04: Main Entrance</option>
                  <option value="Camera_Node_02" className="bg-black">Node 02: Science Wing</option>
                  <option value="Camera_Node_09" className="bg-black">Node 09: Faculty Lounge</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">FPS: 30 // 4K // P2P</span>
                <Badge variant="outline" className="border-primary/40 text-primary uppercase text-[9px] font-bold">Neural Link Ready</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="glass-card border-none h-full shadow-2xl">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Identity Recognition Log</span>
              </div>
              <CardTitle className="text-xl text-white">Neural Match Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!result && !loading ? (
                <div className="py-24 text-center opacity-30">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Waiting for Neural Stream</p>
                </div>
              ) : loading ? (
                <div className="py-24 text-center space-y-6">
                  <div className="relative w-fit mx-auto">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <Zap className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary animate-pulse">Running Multi-Entity Inference...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.identifiedEntities.map((entity: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                          {getRoleIcon(entity.role)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{entity.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             {getRoleBadge(entity.role)}
                             <span className="text-[9px] text-muted-foreground font-mono">{(entity.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={entity.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}>
                          {entity.status}
                        </Badge>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Syncing...</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><Zap className="h-4 w-4 text-primary" /></div>
                    <p className="text-[11px] font-medium italic text-muted-foreground leading-relaxed">
                      "System: {result.summary}"
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            {result && (
              <CardFooter className="bg-white/5 p-6 border-t border-white/5">
                <Button className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">Commit Cycles to SIS Registry</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
      `}</style>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Sparkles, Loader2, UserCheck, UserX, Scan, RefreshCcw } from "lucide-react"
import { recognizeAttendance } from "@/ai/flows/ai-attendance-recognition"

export default function AttendancePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    setLoading(true)
    // Simulating camera data for demo purposes
    const placeholderImage = "https://picsum.photos/seed/classroom/800/600"
    try {
      const data = await recognizeAttendance({ photoDataUri: placeholderImage })
      setResult(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">AI Attendance</h2>
          <p className="text-muted-foreground text-lg">Facial recognition and biometric identity verification.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5">
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Stream
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleScan} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scan className="mr-2 h-4 w-4" />}
            Initiate AI Scan
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="glass-card border-none overflow-hidden relative group h-[500px]">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
            <img src="https://picsum.photos/seed/classroom/1200/800" alt="Live Stream" className="w-full h-full object-cover" />
            
            {/* AI HUD Overlay */}
            <div className="absolute inset-0 p-8 pointer-events-none">
              <div className="border-2 border-primary/40 rounded-3xl w-full h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                
                {loading && (
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/60 shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-pulse" style={{ animation: 'scan 2s infinite linear' }} />
                )}
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">Camera_Node_04 // active</span>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary uppercase text-[9px] font-bold">4K AI Stream</Badge>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="glass-card border-none h-full">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Recognition Log</span>
              </div>
              <CardTitle className="text-xl text-white">Detection Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!result && !loading ? (
                <div className="py-20 text-center opacity-40">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scan classroom to populate</p>
                </div>
              ) : loading ? (
                <div className="py-20 text-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">Running Neural Inference...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.identifiedStudents.map((student: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          {student.status === 'Present' ? <UserCheck className="h-5 w-5 text-emerald-500" /> : <UserX className="h-5 w-5 text-orange-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{student.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Confidence: {(student.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      <Badge className={student.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}>
                        {student.status}
                      </Badge>
                    </div>
                  ))}
                  <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs italic text-muted-foreground leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            {result && (
              <CardFooter className="bg-white/5 p-6 border-t border-white/5">
                <Button className="w-full rounded-xl font-bold uppercase tracking-widest text-[10px]">Sync Records to SIS</Button>
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

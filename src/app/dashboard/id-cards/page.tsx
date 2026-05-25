"use client"

import { useState } from "react"
import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  ShieldCheck, 
  Download, 
  Share2, 
  Sparkles, 
  Cpu,
  Fingerprint,
  UserCircle
} from "lucide-react"

export default function DigitalIDPage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 uppercase tracking-widest text-[9px] font-bold">
              Neural Credential Node
            </Badge>
            <Fingerprint className="h-3 w-3 text-emerald-500 animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Institutional Pass</h2>
          <p className="text-muted-foreground text-lg">Axora-verified digital identity and secure campus credentials.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5" onClick={handleDownload} disabled={downloading}>
            <Download className="mr-2 h-4 w-4" /> Export Key
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-bold uppercase tracking-widest text-[10px]">
            <Share2 className="mr-2 h-4 w-4" /> Share Token
          </Button>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 items-center">
        {/* The Digital ID Card */}
        <div className="perspective-card group">
          <div className="relative w-full aspect-[1.58/1] rounded-[2rem] overflow-hidden glass-card border-2 border-white/10 p-8 shadow-2xl transition-all duration-700 group-hover:border-primary/40 group-hover:scale-[1.02]">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://placehold.co/1000x1000/000/ffffff?text=+')] bg-repeat" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Sparkles className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase">Axora OS</span>
                      <span className="text-[8px] font-bold text-primary uppercase">Institutional Node</span>
                   </div>
                </div>
                <Badge variant="outline" className="text-[8px] font-bold border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                  ACTIVE_LINK
                </Badge>
              </div>

              <div className="flex gap-6 items-end mt-4">
                <div className="h-24 w-24 rounded-2xl border-2 border-white/10 bg-white/5 overflow-hidden flex items-center justify-center relative">
                   <UserCircle className="h-12 w-12 text-white/20" />
                   {/* Simulated Neural Scan Lines */}
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent h-1 w-full animate-scan" />
                </div>
                <div className="flex-1 space-y-1 pb-2">
                   <p className="text-xl font-bold text-white tracking-tight uppercase leading-none">
                     {profile?.displayName || 'Loading Scholar...'}
                   </p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     {profile?.role || 'Guest'} // {profile?.schoolId || 'ID: 0000'}
                   </p>
                   <div className="pt-2 flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <span className="text-[8px] font-bold text-emerald-500/80 uppercase">Identity Verified by Axora</span>
                   </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                 <div className="space-y-1">
                    <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Neural Hash</p>
                    <p className="text-[9px] font-mono text-white/40 tracking-tighter">NODE_ACCESS_{user?.uid.slice(0, 12).toUpperCase()}</p>
                 </div>
                 <div className="h-12 w-12 bg-white rounded-lg p-1.5 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <QrCode className="h-full w-full text-black" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Stats & Security Log */}
        <div className="space-y-6">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Identity Matrix</span>
              </div>
              <CardTitle className="text-xl text-white">Neural Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               {[
                 { label: "Verification Confidence", value: "99.8%", color: "text-emerald-400" },
                 { label: "Campus Access Rank", value: "Tier 1", color: "text-primary" },
                 { label: "Last Neural Match", value: "2 hours ago", color: "text-white" },
                 { label: "Security Clearance", value: "Standard", color: "text-muted-foreground" },
               ].map((stat) => (
                 <div key={stat.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-none">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                    <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
                 </div>
               ))}
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
             </div>
             <div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Secure Node Access</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                   Your identity token is synchronized across all institutional cameras and security hubs. 
                </p>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .perspective-card {
          perspective: 1000px;
        }
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
        .animate-scan {
          animation: scan 4s infinite linear;
        }
      `}</style>
    </div>
  )
}

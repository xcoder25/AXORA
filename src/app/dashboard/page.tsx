'use client';

import { useState } from 'react';
import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Bell, 
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
  Activity,
  MessageSquare,
  Loader2,
  ChevronRight,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAxoraAdmin } from "@/ai/flows/axora-institutional-intelligence";

export default function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const [adminQuery, setAdminQuery] = useState("");
  const [axoraResponse, setAxoraResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const stats = [
    { title: "Identity Hub", value: "Syncing", icon: Eye, color: "text-primary", trend: "Deep Vision Active" },
    { title: "Courses", value: "12", icon: BookOpen, color: "text-blue-400", trend: "16 Modules" },
    { title: "Institutional Load", value: "Low", icon: Activity, color: "text-emerald-400", trend: "Node Stability 100%" },
    { title: "Risk Index", value: "0.02", icon: ShieldCheck, color: "text-accent", trend: "Secure Node" },
  ];

  async function handleAxoraCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!adminQuery) return;
    setLoading(true);
    try {
      const result = await askAxoraAdmin({
        query: adminQuery,
        schoolContext: {
          studentCount: 1284,
          teacherCount: 48,
          revenueCollectionRate: 96,
          averageAttendance: 94,
          riskIndex: 0.02
        }
      });
      setAxoraResponse(result);
      setAdminQuery("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[9px] h-5">
              Institutional Node Active
            </Badge>
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">
            Portal Access: <span className="text-glow text-primary">{profile?.displayName?.split(' ')[0] || 'Scholar'}</span>
          </h2>
          <p className="text-muted-foreground text-base font-medium max-w-xl">
            Axora Core has synchronized all academic and security telemetry.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/3 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {profile?.displayName?.[0] || 'S'}
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">{profile?.role || 'USER'}</p>
            <p className="text-[10px] text-muted-foreground font-mono">NODE_{user?.uid.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <Card className="premium-gradient border-none shadow-2xl overflow-hidden rounded-3xl group">
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Axora Admin Intelligence Hub</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">How can I assist the Institution today?</CardTitle>
            <CardDescription className="text-white/70">Ask me to analyze performance, generate reports, or dispatch campus-wide alerts.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pb-6">
            <form onSubmit={handleAxoraCommand} className="flex gap-2">
              <Input 
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
                placeholder="e.g., 'Analyze our revenue trend and suggest a parent memo for outstanding fees'" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:ring-accent"
              />
              <Button type="submit" className="bg-white text-primary hover:bg-accent hover:text-white h-12 px-6 rounded-xl font-bold transition-all shadow-xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> EXECUTE</>}
              </Button>
            </form>
            
            {axoraResponse && (
              <div className="mt-6 p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-accent/20 text-accent border-accent/30 uppercase text-[9px] font-black">{axoraResponse.verdict} STATUS</Badge>
                  <span className="text-[9px] font-mono text-white/40">Inference Complete</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-6 italic">"{axoraResponse.analysis}"</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase text-accent tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Strategic Protocols
                    </h4>
                    {axoraResponse.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="text-xs text-white/70 flex gap-2">
                        <span className="text-accent font-bold">•</span> {rec}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                      <Zap className="h-3 w-3" /> Instant Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {axoraResponse.suggestedActions.map((action: any, i: number) => (
                        <Button key={i} variant="outline" className="h-8 border-white/10 bg-white/5 text-[9px] font-bold uppercase hover:bg-primary transition-all">
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="absolute top-0 right-0 -m-8 h-64 w-64 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={stat.title} className="glass-card group hover:border-primary/30 transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} transition-transform group-hover:scale-110`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-white mb-1">{stat.value}</div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 glass-card border-none shadow-2xl">
          <CardHeader className="bg-white/3 pb-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-xl text-white">Neural Integrity Stream</CardTitle>
                <CardDescription className="text-muted-foreground text-xs font-medium">Axora's deep vision identification logs.</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Identity Match: Node 0{i}</p>
                      <span className="text-[9px] font-semibold text-muted-foreground">Recent</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      Axora verified {i % 2 === 0 ? 'Faculty' : 'Student'} recognition. Academic registry updated.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-white/3 p-4 border-t border-white/5">
             <Button variant="ghost" className="w-full text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
               View Full Identity Matrix <ChevronRight className="ml-2 h-3 w-3" />
             </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/3">
              <CardTitle className="font-headline text-xl text-white">Axora Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
              {[
                { title: "Neural Identity", icon: Eye, color: "text-primary", href: "/dashboard/attendance" },
                { title: "Security Matrix", icon: ShieldCheck, color: "text-accent", href: "/dashboard/security" },
                { title: "Strategic Resources", icon: Sparkles, color: "text-blue-400", href: "/dashboard/resources" },
              ].map((action, i) => (
                <Link 
                  key={i} 
                  href={action.href}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/3 p-4 hover:bg-primary transition-all duration-500 group"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className={`h-4 w-4 ${action.color} group-hover:text-white transition-colors`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">{action.title}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 group-hover:text-white" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="premium-gradient border-none overflow-hidden relative group rounded-3xl shadow-2xl">
            <CardContent className="p-8">
              <Sparkles className="h-8 w-8 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white leading-tight mb-2">Nexora Enterprise</h3>
              <p className="text-white/70 text-xs font-medium mb-6">Unlock dedicated neural clusters and priority Axora deep vision nodes.</p>
              <Button className="w-full bg-white text-primary font-bold hover:bg-accent hover:text-white transition-all rounded-xl h-11 text-xs shadow-xl">
                UPGRADE INFRASTRUCTURE
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

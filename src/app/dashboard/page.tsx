'use client';

import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Activity
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);

  const stats = [
    { title: "Identity Hub", value: "Syncing", icon: Eye, color: "text-primary", trend: "Deep Vision Active" },
    { title: "Courses", value: "12", icon: BookOpen, color: "text-blue-400", trend: "16 Modules" },
    { title: "Institutional Load", value: "Low", icon: Activity, color: "text-emerald-400", trend: "Node Stability 100%" },
    { title: "Risk Index", value: "0.02", icon: ShieldCheck, color: "text-accent", trend: "Secure Node" },
  ];

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
            Institutional metrics synchronized with Nexora Core. All nodes reporting optimal connectivity.
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
        <Card className="lg:col-span-4 glass-card border-none">
          <CardHeader className="bg-white/3 pb-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-xl text-white">Neural Integrity Stream</CardTitle>
                <CardDescription className="text-muted-foreground text-xs font-medium">Deep Vision identification logs.</CardDescription>
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
                      Faculty recognition complete. Academic registry updated at 0.02ms latency.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card border-none">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/3">
              <CardTitle className="font-headline text-xl text-white">Quick Access Nodes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
              {[
                { title: "Neural Identity", icon: Eye, color: "text-primary", href: "/dashboard/attendance" },
                { title: "Security Matrix", icon: ShieldCheck, color: "text-accent", href: "/dashboard/security" },
                { title: "Resources", icon: Sparkles, color: "text-blue-400", href: "/dashboard/resources" },
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

          <Card className="premium-gradient border-none overflow-hidden relative group rounded-3xl">
            <CardContent className="p-8">
              <Sparkles className="h-8 w-8 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white leading-tight mb-2">Nexora Enterprise</h3>
              <p className="text-white/70 text-xs font-medium mb-6">Access dedicated neural clusters and priority deep vision processing.</p>
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

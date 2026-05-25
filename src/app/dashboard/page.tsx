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
  Search,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);

  const stats = [
    { title: "Network Status", value: "Optimal", icon: Zap, color: "text-accent", trend: "High Availability" },
    { title: "Course Load", value: "12", icon: BookOpen, color: "text-primary", trend: "3 New Modules" },
    { title: "Participation", value: "92%", icon: Users, color: "text-blue-400", trend: "+5% Weekly" },
    { title: "Index Score", value: "8.4", icon: TrendingUp, color: "text-emerald-400", trend: "Strong Growth" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] h-5">
              Secure Session
            </Badge>
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          </div>
          <h2 className="font-headline text-5xl font-black text-white tracking-tighter">
            Welcome, <span className="text-glow text-primary">{profile?.displayName?.split(' ')[0] || 'Scholar'}</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium max-w-xl">
            Your intelligence-enhanced academic command center is ready. Review your metrics below.
          </p>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all" />
          <div className="relative flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xl">
              {profile?.displayName?.[0] || 'S'}
            </div>
            <div>
              <p className="text-sm font-black text-white">{profile?.role?.toUpperCase() || 'USER'}</p>
              <p className="text-xs text-muted-foreground">ID: {user?.uid.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={stat.title} className="glass-card group hover:border-primary/50 transition-all duration-500 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-all group-hover:opacity-40 ${stat.color === 'text-accent' ? 'bg-accent' : 'bg-primary'}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter text-white mb-1">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 glass-card border-none overflow-hidden">
          <CardHeader className="bg-white/5 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-2xl text-white">Academic Stream</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Real-time intelligence from your network.</CardDescription>
              </div>
              <Bell className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all border border-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-white tracking-tight">AI Assessment Finalized</p>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">4m ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Quantum Dynamics Module 4 evaluation has been processed with 98% semantic accuracy.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-2xl text-white">Quick Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Course Registry", icon: BookOpen, color: "text-primary", href: "/dashboard/courses" },
                { title: "Performance AI", icon: TrendingUp, color: "text-accent", href: "/dashboard/performance" },
                { title: "Search Knowledge", icon: Search, color: "text-blue-400", href: "#" },
              ].map((action, i) => (
                <Link 
                  key={i} 
                  href={action.href}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-primary hover:text-white transition-all duration-500 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl bg-background/50 group-hover:bg-white/20`}>
                      <action.icon className={`h-5 w-5 ${action.color} group-hover:text-white`} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">{action.title}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-indigo-900 border-none shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/tech/800/600')] bg-cover opacity-10 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
            <CardContent className="p-8 relative">
              <Sparkles className="h-8 w-8 text-white mb-4" />
              <h3 className="text-xl font-black text-white leading-tight mb-2">Upgrade to ScholAI Pro</h3>
              <p className="text-white/70 text-sm font-medium mb-6">Unlock advanced predictive models and 24/7 intelligence support.</p>
              <Button className="w-full bg-white text-primary font-black hover:bg-accent hover:text-white transition-all rounded-xl h-11">
                GO PRO NOW
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
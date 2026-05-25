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
    { title: "Status", value: "Optimal", icon: Zap, color: "text-accent", trend: "High Availability" },
    { title: "Courses", value: "12", icon: BookOpen, color: "text-primary", trend: "3 New" },
    { title: "Engagement", value: "92%", icon: Users, color: "text-blue-400", trend: "+5%" },
    { title: "Growth", value: "8.4", icon: TrendingUp, color: "text-emerald-400", trend: "Stable" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[9px] h-5">
              Secure Session
            </Badge>
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">
            Welcome, <span className="text-glow text-primary">{profile?.displayName?.split(' ')[0] || 'Scholar'}</span>
          </h2>
          <p className="text-muted-foreground text-base font-medium max-w-xl">
            Review your academic metrics and personalized insights below.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/3 border border-white/5 p-4 rounded-xl backdrop-blur-xl">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {profile?.displayName?.[0] || 'S'}
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">{profile?.role || 'USER'}</p>
            <p className="text-[10px] text-muted-foreground font-mono">NODE_{user?.uid.slice(0, 6)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={stat.title} className="glass-card group hover:border-primary/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
          <CardHeader className="bg-white/3 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-xl text-white">Academic Stream</CardTitle>
                <CardDescription className="text-muted-foreground text-xs font-medium">Real-time intelligence updates.</CardDescription>
              </div>
              <Bell className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Processed</p>
                      <span className="text-[9px] font-semibold text-muted-foreground">4m ago</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      Module 4 assessment finalized with 98% semantic accuracy.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card border-none">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-xl text-white">Quick Ops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { title: "Course Registry", icon: BookOpen, color: "text-primary", href: "/dashboard/courses" },
                { title: "Performance", icon: TrendingUp, color: "text-accent", href: "/dashboard/performance" },
                { title: "Resources", icon: Sparkles, color: "text-blue-400", href: "/dashboard/resources" },
              ].map((action, i) => (
                <Link 
                  key={i} 
                  href={action.href}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/3 p-4 hover:bg-primary hover:text-white transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className={`h-4 w-4 ${action.color} group-hover:text-white`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{action.title}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="premium-gradient border-none overflow-hidden relative group">
            <CardContent className="p-6">
              <Sparkles className="h-6 w-6 text-white mb-3" />
              <h3 className="text-lg font-bold text-white leading-tight mb-2">Upgrade to Pro</h3>
              <p className="text-white/70 text-xs font-medium mb-4">Unlock predictive models and 24/7 support.</p>
              <Button className="w-full bg-white text-primary font-bold hover:bg-accent hover:text-white transition-all rounded-lg h-10 text-xs">
                GO PRO NOW
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
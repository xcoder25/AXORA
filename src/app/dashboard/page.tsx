'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  BookOpen, ArrowRight, Sparkles, Zap, ShieldCheck, Eye, Activity, Loader2,
  ChevronRight, Cpu, TrendingUp, Brain, DollarSign, GraduationCap, Users,
  CheckCircle2, AlertTriangle, Camera, ClipboardList, BarChart3, Bell,
  Wifi, Radio
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askAxoraAdmin } from '@/ai/flows/axora-institutional-intelligence';
import { formatRoleLabel, isAdminRole } from '@/lib/roles';
import { CampusNoticeBoard } from '@/components/campus-notice-board';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';
import { cn } from '@/lib/utils';
import { useRealtimeActivity } from '@/hooks/use-realtime-activity';
import { useRealtimeKpis } from '@/hooks/use-realtime-kpis';

// ── Animated KPI Ring ─────────────────────────────────────────────────────────
function KpiRing({
  value, max = 100, size = 80, strokeWidth = 6, color = '#6366f1', label, sublabel, changed
}: {
  value: number; max?: number; size?: number; strokeWidth?: number;
  color?: string; label: string; sublabel?: string; changed?: boolean;
}) {
  const [animated, setAnimated] = useState(0);
  const [flash, setFlash] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(animated / max, 1);
  const dashOffset = circumference * (1 - pct);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 200);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (changed) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1500);
    }
  }, [changed, value]);

  return (
    <div className={cn('flex flex-col items-center gap-2 transition-all duration-500', flash && 'scale-105')}>
      <div className="relative" style={{ width: size, height: size }}>
        {flash && (
          <div
            className="absolute inset-0 rounded-full opacity-0 animate-ping"
            style={{ backgroundColor: color, opacity: 0.15 }}
          />
        )}
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white" style={{ color }}>
            {typeof value === 'number' && max === 100 ? `${Math.round(animated)}%` : Math.round(animated)}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">{label}</p>
        {sublabel && <p className="text-[8px] text-white/30 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Live Activity Feed Item ───────────────────────────────────────────────────
const EVENT_ICONS: Record<string, any> = {
  identity: Camera,
  finance: DollarSign,
  security: ShieldCheck,
  exam: ClipboardList,
  admin: Users,
  ai: Brain,
  info: Bell,
};

const EVENT_COLORS: Record<string, string> = {
  identity: 'bg-primary/20 text-primary border-primary/30',
  finance: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  security: 'bg-red-500/20 text-red-400 border-red-500/30',
  exam: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  admin: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  ai: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  info: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function FeedItem({ type, title, description, time, isNew }: {
  type: string; title: string; description: string; time: string; isNew?: boolean;
}) {
  const Icon = EVENT_ICONS[type] ?? Bell;
  const colors = EVENT_COLORS[type] ?? EVENT_COLORS.info;

  return (
    <div className={cn(
      'feed-item group transition-all duration-500',
      isNew && 'animate-in fade-in slide-in-from-left-4 duration-500'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px]', colors)}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-white truncate">{title}</p>
            {isNew && (
              <span className="shrink-0 rounded-full bg-emerald-500/20 text-emerald-400 text-[7px] font-black uppercase px-1.5 py-0.5 border border-emerald-500/30 animate-pulse">
                NEW
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">{description}</p>
        </div>
        <span className="text-[8px] text-white/25 font-mono shrink-0">{time}</span>
      </div>
    </div>
  );
}

// ── Neural Status Pill ────────────────────────────────────────────────────────
function NeuralStatusPill({ label, value, icon: Icon }: {
  label: string; value: string | number; icon: any;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5">
      <Icon className="h-3 w-3 text-primary opacity-70" />
      <div>
        <p className="text-[7px] uppercase font-bold tracking-widest text-white/30">{label}</p>
        <p className="text-[11px] font-black text-white">{value}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const { data: school } = useDoc(profile?.schoolId ? `schools/${profile.schoolId}` : null);
  const [adminQuery, setAdminQuery] = useState('');
  const [axoraResponse, setAxoraResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncLabel, setSyncLabel] = useState('Syncing…');

  const isAdmin = isAdminRole(profile?.role);
  const firstName = profile?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const schoolId = profile?.schoolId as string | undefined;

  // Real-time hooks
  const { events, newEventId } = useRealtimeActivity(schoolId);
  const { kpis, changed } = useRealtimeKpis(schoolId);

  // Sync label ticker
  useEffect(() => {
    let secs = 0;
    const interval = setInterval(() => {
      secs++;
      setSyncLabel(`Synced ${secs}s ago`);
      if (secs >= 30) secs = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const kpiConfig = [
    { label: 'Attendance', sublabel: 'Today', value: kpis.attendance, color: '#6366f1', key: 'attendance' as const },
    { label: 'Fee Collection', sublabel: 'This term', value: kpis.feeCollection, color: '#22c55e', key: 'feeCollection' as const },
    { label: 'Exam Pass Rate', sublabel: 'Last session', value: kpis.examPassRate, color: '#3b82f6', key: 'examPassRate' as const },
    { label: 'Security Index', sublabel: 'Campus risk', value: kpis.securityIndex, color: '#8b5cf6', key: 'securityIndex' as const },
  ];

  const moduleCards = [
    { title: 'NEXORA AI Hub', desc: 'Institutional intelligence center', icon: Brain, href: '/dashboard/nexora', gradient: 'from-violet-600 to-purple-700', badge: 'NEW' },
    { title: 'Finance Command', desc: 'Full accountant suite', icon: DollarSign, href: '/dashboard/finance', gradient: 'from-emerald-600 to-teal-700', badge: null },
    { title: 'Identity Matrix', desc: 'Deep vision surveillance', icon: Camera, href: '/dashboard/attendance', gradient: 'from-indigo-600 to-blue-700', badge: 'LIVE' },
    { title: 'CBT Engine', desc: 'AI-powered exam system', icon: ClipboardList, href: '/dashboard/exams', gradient: 'from-orange-600 to-amber-700', badge: null },
    { title: 'Security Node', desc: 'CCTV & threat detection', icon: ShieldCheck, href: '/dashboard/security', gradient: 'from-red-600 to-rose-700', badge: null },
    { title: 'Academic Engine', desc: 'Grades, reports, analytics', icon: GraduationCap, href: '/dashboard/academic', gradient: 'from-blue-600 to-cyan-700', badge: null },
  ];

  async function handleAxoraCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!adminQuery) return;
    setLoading(true);
    startAxoraLoading('Running institutional intelligence…');
    try {
      const result = await askAxoraAdmin({
        query: adminQuery,
        schoolContext: {
          studentCount: kpis.studentsOnCampus,
          teacherCount: 48,
          revenueCollectionRate: kpis.feeCollection,
          averageAttendance: kpis.attendance,
          riskIndex: (100 - kpis.securityIndex) / 100,
        },
      });
      setAxoraResponse(result);
      setAdminQuery('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      stopAxoraLoading();
    }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">

      {/* ── Hero Welcome Row ─────────────────────────────── */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2 animate-in fade-in slide-in-from-left-3 duration-700">
          <div className="flex items-center gap-2">
            <Badge className="h-5 border-primary/30 bg-primary/15 font-bold uppercase tracking-widest text-[9px] text-primary">
              {formatRoleLabel(profile?.role)} Portal
            </Badge>
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
          </div>
          <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="gradient-text-primary">{firstName}</span>
          </h2>
          <p className="max-w-xl text-base font-medium text-muted-foreground">
            Axora has synchronized all academic, financial, and security telemetry.
          </p>
        </div>

        {/* Neural Status Pills */}
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-right-3 duration-700 delay-100">
          <NeuralStatusPill label="On Campus" value={kpis.studentsOnCampus.toLocaleString()} icon={Users} />
          <NeuralStatusPill label="Active Nodes" value={`${kpis.activeNodes} Online`} icon={Radio} />
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-[7px] uppercase font-bold tracking-widest text-emerald-400/60">Neural Link</p>
              <p className="text-[11px] font-black text-emerald-400">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Matrix ─────────────────────────────────────── */}
      <Card className="glass-card border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <CardHeader className="pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">Institutional KPI Matrix</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-mono text-white/25">{syncLabel}</span>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase">
                <span className="status-live" />Live
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-wrap justify-around gap-6">
            {kpiConfig.map(kpi => (
              <KpiRing
                key={kpi.label}
                {...kpi}
                size={90}
                strokeWidth={7}
                changed={changed[kpi.key]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Admin Intelligence Hub ────────────────────────── */}
      {isAdmin && (
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-indigo-600 to-violet-700 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-700">
          <CardHeader className="relative z-10 pb-4">
            <div className="mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4 animate-pulse text-indigo-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Admin Intelligence Hub · AXIOM</span>
            </div>
            <CardTitle className="text-2xl font-bold">How can I assist the institution today?</CardTitle>
            <CardDescription className="text-indigo-100">
              Analyze performance, generate reports, or plan campus-wide actions using natural language.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pb-6">
            <form onSubmit={handleAxoraCommand} className="flex gap-2">
              <Input
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
                placeholder='e.g. "Analyze revenue trends and draft a parent memo"'
                className="h-12 rounded-xl border-white/20 bg-white/15 text-white placeholder:text-white/40 focus:ring-white/30"
              />
              <Button
                type="submit"
                className="h-12 rounded-xl bg-white px-6 font-black text-primary shadow-xl transition-all hover:bg-indigo-50 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" />Run</>}
              </Button>
            </form>
            {axoraResponse && (
              <div className="mt-6 animate-in zoom-in-95 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl duration-500">
                <Badge className="mb-4 border-white/30 bg-white/20 text-[9px] font-black uppercase text-white">
                  {axoraResponse.verdict} STATUS
                </Badge>
                <p className="mb-6 text-sm italic leading-relaxed text-white/95">
                  &ldquo;{axoraResponse.analysis}&rdquo;
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    {axoraResponse.recommendations?.map((rec: string, i: number) => (
                      <p key={i} className="flex gap-2 text-xs text-indigo-100">
                        <span className="font-bold text-white">•</span> {rec}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {axoraResponse.suggestedActions?.map((action: any, i: number) => (
                      <Button key={i} variant="outline"
                        className="h-8 border-white/20 bg-white/10 text-[9px] font-bold uppercase text-white hover:bg-white/25">
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-48 w-48 rounded-full bg-violet-400/20 blur-[60px]" />
        </Card>
      )}

      {/* ── Module Cards Grid ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40">All Modules</h3>
          <Badge className="bg-white/5 text-white/40 border-white/10 text-[8px]">6 Active</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleCards.map((mod, i) => (
            <Link key={mod.title} href={mod.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110', mod.gradient)}>
                  <mod.icon className="h-5 w-5" />
                </div>
                {mod.badge && (
                  <Badge className={cn('text-[8px] font-black border-none',
                    mod.badge === 'NEW' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {mod.badge === 'LIVE' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />}
                    {mod.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-bold text-white mb-1">{mod.title}</p>
              <p className="text-[10px] text-white/40">{mod.desc}</p>
              <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 text-white/20 transition-all duration-300 group-hover:text-white/60 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom Row: Live Activity Feed + Notice Board ──── */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* Live Activity Feed — Real-Time */}
        <Card className="glass-card border-white/5 lg:col-span-5">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">Live Activity Feed</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {events.length > 0 && (
                  <span className="text-[8px] font-mono text-white/25">{events.length} events</span>
                )}
                <Badge className="bg-emerald-500/10 border-emerald-500/20 text-[8px] text-emerald-400 font-black flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-1">
              {events.length === 0 ? (
                // Loading skeleton
                [...Array(4)].map((_, i) => (
                  <div key={i} className="feed-item">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg shimmer shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 rounded shimmer" />
                        <div className="h-2.5 w-48 rounded shimmer" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                events.slice(0, 7).map((event, i) => (
                  <FeedItem
                    key={event.id}
                    type={event.type}
                    title={event.title}
                    description={event.description}
                    time={event.time}
                    isNew={event.id === newEventId}
                  />
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-white/5 p-4">
            <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
              View All System Events <ChevronRight className="ml-2 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        {/* Notice Board */}
        <div className="lg:col-span-7">
          <CampusNoticeBoard schoolId={schoolId} compact />
        </div>
      </div>

      {/* ── Quick Access & Nexora Card ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-card border-white/5 lg:col-span-2">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {[
              { title: 'Neural Identity Matrix', icon: Eye, href: '/dashboard/attendance', desc: 'Live camera feeds & AI recognition' },
              { title: 'Security Command', icon: ShieldCheck, href: '/dashboard/security', desc: 'Integrated CCTV & threat detection' },
              { title: 'Strategic Resources', icon: Sparkles, href: '/dashboard/resources', desc: 'Syllabi, study plans & TTS briefings' },
              { title: 'Smart Workflows', icon: Zap, href: '/dashboard/workflows', desc: 'If-then automation triggers' },
            ].map((action, i) => (
              <Link key={i} href={action.href}
                className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-primary/30 hover:bg-primary/10"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <div>
                    <span className="text-xs font-bold text-white">{action.title}</span>
                    <p className="text-[9px] text-white/30">{action.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* NEXORA Promo Card */}
        <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:shadow-violet-500/20">
          <CardContent className="p-8 h-full flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-4">
                <Brain className="h-6 w-6 text-white animate-float" />
              </div>
              <h3 className="text-xl font-black leading-tight text-white mb-2">NEXORA AI Hub</h3>
              <p className="text-xs font-medium text-white/70 mb-6">
                Institutional IQ score, predictive analytics, and AI report generation. The intelligence layer for your campus.
              </p>
            </div>
            <Link href="/dashboard/nexora">
              <Button className="h-11 w-full rounded-xl bg-white text-xs font-black text-violet-700 shadow-xl hover:bg-violet-50 transition-all hover:scale-[1.02]">
                <Brain className="mr-2 h-4 w-4" /> Open AI Hub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

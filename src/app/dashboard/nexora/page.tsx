'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Brain, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Users,
  DollarSign, CheckCircle2, BarChart3, Activity, Cpu, FileText,
  Download, RefreshCw, Loader2, Mic, MicOff, Play, Zap,
  GraduationCap, ShieldCheck, ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ─── IQ Score Ring ────────────────────────────────────────────────────────────
function IQScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = animated / 100;
  const offset = circumference * (1 - pct);

  // Color based on score
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 85 ? 'EXCEPTIONAL' : score >= 70 ? 'STRONG' : score >= 50 ? 'MODERATE' : 'CRITICAL';

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 400);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer glow ring */}
        <svg width={size} height={size} className="absolute inset-0" style={{ filter: `drop-shadow(0 0 16px ${color}60)` }}>
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={2} strokeDasharray="4 6" opacity={0.3}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
        {/* Main ring */}
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color }}>{Math.round(animated)}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">IQ Score</span>
        </div>
      </div>
      <Badge className="border-none font-black text-[9px] uppercase tracking-widest px-4 py-1"
        style={{ background: `${color}20`, color }}>
        {label}
      </Badge>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, change, icon: Icon, color, good }: {
  label: string; value: string; change: string; icon: any; color: string; good: boolean;
}) {
  return (
    <div className="glass-card-glow rounded-2xl p-5 flex flex-col gap-3 group hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className={cn('flex items-center gap-1 text-[10px] font-black',
          good ? 'text-emerald-400' : 'text-red-400')}>
          {good ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Prediction Card ──────────────────────────────────────────────────────────
function PredictionCard({ title, desc, risk, action }: {
  title: string; desc: string; risk: 'low' | 'medium' | 'high'; action: string;
}) {
  const riskConfig = {
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Low Risk' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Medium Risk' },
    high: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'High Risk' },
  };
  const cfg = riskConfig[risk];
  return (
    <div className="glass-card border-white/5 rounded-2xl p-4 space-y-3 group hover:border-white/10 transition-all">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-white flex-1 pr-2">{title}</p>
        <Badge className={cn('text-[8px] font-black border shrink-0', cfg.bg, cfg.color)}>{cfg.label}</Badge>
      </div>
      <p className="text-[10px] text-white/40 leading-relaxed">{desc}</p>
      <Button variant="ghost" size="sm" className="h-7 rounded-xl text-[9px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 px-3 w-full">
        {action} <ChevronRight className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
}

// ─── Report Item ─────────────────────────────────────────────────────────────
function ReportItem({ title, type, date, status }: {
  title: string; type: string; date: string; status: 'ready' | 'generating';
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">{title}</p>
          <p className="text-[9px] text-white/30">{type} · {date}</p>
        </div>
      </div>
      {status === 'ready' ? (
        <Button size="sm" variant="ghost" className="h-7 rounded-xl text-[9px] uppercase text-primary hover:bg-primary/10">
          <Download className="mr-1 h-3 w-3" /> Export
        </Button>
      ) : (
        <Badge className="bg-amber-500/10 text-amber-400 border-none text-[8px] font-black flex items-center gap-1">
          <Loader2 className="h-2.5 w-2.5 animate-spin" /> Generating
        </Badge>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NexoraHubPage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsActive, setTtsActive] = useState(false);
  const [briefText, setBriefText] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);

  const iqScore = 87;

  const metrics = [
    { label: 'Students Enrolled', value: '1,284', change: '+12 this week', icon: Users, color: 'text-primary bg-primary/10 border-primary/20', good: true },
    { label: 'Revenue Collection', value: '96.2%', change: '+2.1% vs last term', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', good: true },
    { label: 'Avg Attendance', value: '94.1%', change: '-0.8% this week', icon: CheckCircle2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', good: false },
    { label: 'Exam Pass Rate', value: '88.5%', change: '+3.2% vs last session', icon: GraduationCap, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', good: true },
    { label: 'Security Index', value: '98.0', change: 'Stable — 0 incidents', icon: ShieldCheck, color: 'text-red-400 bg-red-500/10 border-red-500/20', good: true },
    { label: 'Debt Recovery', value: '$24.2K', change: '+$3.1K this week', icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', good: true },
  ];

  const predictions = [
    { title: '3 students at risk of dropout', desc: 'Based on attendance below 60% and failed assignments in 4+ subjects. Immediate counseling recommended.', risk: 'high' as const, action: 'View At-Risk Students' },
    { title: '12 accounts likely to default on fees', desc: 'Accounts with 90+ day aging showing pattern consistent with non-payment. Proactive outreach advised.', risk: 'medium' as const, action: 'Send Reminders' },
    { title: 'Exam pass rate improving', desc: 'CBT scores trending +3.2% from last session. Current trajectory suggests end-of-term target will be met.', risk: 'low' as const, action: 'View Analytics' },
    { title: 'Camera Node 07 maintenance due', desc: 'Node 07 (Parking Bay) has been degraded for 8 days. Hardware maintenance recommended within 48 hours.', risk: 'medium' as const, action: 'View Security Nodes' },
  ];

  const reports = [
    { title: 'Monthly Financial Summary', type: 'Finance Report', date: 'Jun 2026', status: 'ready' as const },
    { title: 'Academic Performance Overview', type: 'Academic Report', date: 'Term 2, 2026', status: 'ready' as const },
    { title: 'Board Meeting Dossier', type: 'Executive Report', date: 'Q2 2026', status: 'generating' as const },
    { title: 'Student Attendance Ledger', type: 'Attendance Report', date: 'May–Jun 2026', status: 'ready' as const },
  ];

  const generateBrief = async () => {
    setBriefLoading(true);
    setBriefText('');
    // Simulate AI brief generation
    await new Promise(r => setTimeout(r, 2000));
    const brief = `Good morning. Today's institutional intelligence briefing for your campus: 
    
Attendance stands at 94.1%, which is 0.8 percentage points below last week. The finance node reports a 96.2% collection rate with $24,200 recovered in outstanding accounts this week — an excellent result. 

The CBT Engine successfully conducted 3 exam sessions with an average pass rate of 88.5%. Security Command reports all 5 active nodes operational, with 0 flagged incidents overnight.

AXIOM recommends: (1) Dispatch counseling outreach to the 3 at-risk students identified in the dropout prediction model, (2) Escalate the 12 high-aging debt accounts to phone follow-up, and (3) Schedule maintenance for Camera Node 07 within the next 48 hours.

Overall institutional health score: 87 — EXCEPTIONAL.`;
    setBriefText(brief);
    setBriefLoading(false);
  };

  const handleTTS = () => {
    if (!briefText) return;
    if (ttsActive) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(briefText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setTtsActive(false);
    window.speechSynthesis.speak(utterance);
    setTtsActive(true);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 font-black uppercase tracking-widest text-[9px]">
              <Cpu className="mr-1 h-3 w-3 animate-pulse" /> Neural Intelligence Layer
            </Badge>
          </div>
          <h2 className="font-headline text-4xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            NEXORA <span className="gradient-text-primary">AI Hub</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl">
            Institutional intelligence command center — predictive analytics, AI report generation, and the neural voice briefing system.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest"
            onClick={generateBrief} disabled={briefLoading}>
            {briefLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Brief
          </Button>
        </div>
      </div>

      {/* ── Top Row: IQ Ring + Key Metrics ───────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* IQ Score */}
        <Card className="glass-card-premium lg:col-span-3 flex flex-col items-center justify-center p-8">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-6">Institutional IQ</p>
          <IQScoreRing score={iqScore} />
          <div className="mt-6 space-y-2 w-full">
            {[
              { label: 'Academic', val: 88 },
              { label: 'Finance', val: 92 },
              { label: 'Security', val: 98 },
            ].map(sub => (
              <div key={sub.label} className="flex items-center gap-3">
                <span className="text-[9px] text-white/40 w-14">{sub.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-1000"
                    style={{ width: `${sub.val}%` }} />
                </div>
                <span className="text-[9px] font-bold text-white/60 w-8 text-right">{sub.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Metric Grid */}
        <div className="lg:col-span-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map(m => <MetricCard key={m.label} {...m} />)}
        </div>
      </div>

      {/* ── AI Voice Briefing ─────────────────────────────── */}
      <Card className="glass-card-premium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-400" />
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Neural Voice Briefing</CardTitle>
              <Badge className="bg-violet-500/10 text-violet-400 border-none text-[8px] font-black">NEXORA TTS</Badge>
            </div>
            <div className="flex items-center gap-2">
              {briefText && (
                <Button size="sm" variant="outline" onClick={handleTTS}
                  className={cn('h-8 rounded-xl text-[9px] font-bold uppercase border-white/10',
                    ttsActive ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-white/5')}>
                  {ttsActive ? <><MicOff className="mr-1 h-3 w-3" /> Stop</> : <><Play className="mr-1 h-3 w-3" /> Play Brief</>}
                </Button>
              )}
              {!briefText && (
                <Button size="sm" onClick={generateBrief} disabled={briefLoading}
                  className="h-8 rounded-xl text-[9px] font-bold uppercase shadow-lg shadow-primary/20">
                  {briefLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Brain className="mr-2 h-3 w-3" />}
                  Generate Brief
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-6">
          {briefLoading ? (
            <div className="flex items-center gap-4 py-6">
              <div className="flex gap-1.5">
                <span className="typing-dot h-2 w-2 rounded-full bg-violet-500" />
                <span className="typing-dot h-2 w-2 rounded-full bg-violet-500" />
                <span className="typing-dot h-2 w-2 rounded-full bg-violet-500" />
              </div>
              <p className="text-sm text-white/40">NEXORA is composing your institutional briefing...</p>
            </div>
          ) : briefText ? (
            <div className="relative pl-5 border-l-2 border-violet-500/30">
              <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">{briefText}</p>
              {ttsActive && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="w-0.5 bg-violet-500 rounded-full"
                        style={{ height: `${Math.random() * 16 + 4}px`, animation: `neural-pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite` }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">NEXORA Voice Active</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-14 w-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-violet-400 neural-pulse" />
              </div>
              <p className="text-sm font-bold text-white/60">Click "Generate Brief" for your AI morning briefing</p>
              <p className="text-[10px] text-white/30 mt-2 max-w-sm">NEXORA will analyze all campus data and deliver a professional spoken summary</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Bottom Row: Predictions + Reports ────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Predictive Analytics */}
        <Card className="glass-card border-white/5">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Predictive Analytics</CardTitle>
            </div>
            <CardDescription className="text-[10px]">AI-generated risk assessments and trend forecasts across all modules.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            {predictions.map((p, i) => <PredictionCard key={i} {...p} />)}
          </CardContent>
        </Card>

        {/* AI Report Generator */}
        <Card className="glass-card border-white/5">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">AI Report Generator</CardTitle>
            </div>
            <CardDescription className="text-[10px]">One-click institutional reports, board dossiers, and parent communications.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            {reports.map((r, i) => <ReportItem key={i} {...r} />)}
          </CardContent>
          <CardFooter className="border-t border-white/5 p-4">
            <Button className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              <Sparkles className="mr-2 h-4 w-4" /> Generate Custom Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { Brain, TrendingUp, AlertTriangle, Sparkles, ShieldCheck, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const performanceData = [
  { month: 'Jan', score: 72, predicted: 72 },
  { month: 'Feb', score: 75, predicted: 75 },
  { month: 'Mar', score: 71, predicted: 71 },
  { month: 'Apr', score: 78, predicted: 80 },
  { month: 'May', score: 82, predicted: 85 },
  { month: 'Jun', score: null, predicted: 88 },
  { month: 'Jul', score: null, predicted: 91 },
]

const subjectData = [
  { subject: 'Math', avg: 82, target: 85 },
  { subject: 'Science', avg: 74, target: 80 },
  { subject: 'English', avg: 88, target: 90 },
  { subject: 'History', avg: 79, target: 85 },
  { subject: 'Art', avg: 92, target: 90 },
]

export default function PerformanceDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[9px] font-bold">
              Predictive Academic Node
            </Badge>
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Outcome Forecasting</h2>
          <p className="text-muted-foreground text-lg">Axora's neural prediction model is calculating upcoming academic benchmarks.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/3 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
           <Brain className="h-5 w-5 text-accent" />
           <div>
             <p className="text-[10px] font-bold text-white uppercase tracking-widest">Axora AI Engine</p>
             <p className="text-[9px] text-accent font-bold uppercase">Active & Learning</p>
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="premium-gradient border-none text-white shadow-2xl relative overflow-hidden group">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-[0.2em]">Predicted Final Grade</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">A-</span>
              <span className="text-primary-foreground/60 text-xs font-mono">(3.74 GPA)</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span>Improving trend detected</span>
            </div>
          </CardContent>
          <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-accent/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
        </Card>

        <Card className="glass-card border-none shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Retention Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">LOW</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-6 px-3">98.2% STABLE</Badge>
            </div>
            <p className="mt-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Based on Engagement Nodes
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Axora Focus Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">Thermodynamics</span>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Concept Gap Detected</p>
              </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full w-[45%] shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            </div>
            <p className="mt-4 text-[9px] font-mono text-muted-foreground uppercase tracking-tighter italic">42% mastery // Class Avg: 68%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="glass-card border-none shadow-2xl">
          <CardHeader className="bg-white/3 border-b border-white/5 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Neural Trend Audit</span>
            </div>
            <CardTitle className="text-xl text-white">Performance Vector</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 700}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#02040a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                <Area type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" fillOpacity={0.05} strokeDasharray="5 5" fill="hsl(var(--accent))" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-2xl">
          <CardHeader className="bg-white/3 border-b border-white/5 p-6">
             <div className="flex items-center gap-2 mb-1">
              <Brain className="h-3.5 w-3.5 text-accent" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Subject Mastery Ledger</span>
            </div>
            <CardTitle className="text-xl text-white">Academic Benchmarks</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 700}} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#02040a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}} />
                <Bar dataKey="avg" name="Current Avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Axora Target" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Axora Contextual Summary */}
      <Card className="glass-card border-none border-t-4 border-t-accent shadow-2xl">
         <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
               <div className="h-24 w-24 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-10 w-10 text-accent animate-pulse" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Axora's Academic Verdict</h3>
                  <p className="text-white/80 leading-relaxed text-base italic">
                    "Institutional performance is trending 4.2% higher than Q2 benchmarks. Math and Literature mastery nodes are optimal, while Science wing requires a 12% increase in engagement to hit the predicted July target of 91%."
                  </p>
                  <div className="flex gap-4">
                     <Badge className="bg-accent/20 text-accent border-accent/30 uppercase text-[9px] px-3 h-6">Predictive Accuracy: 98%</Badge>
                     <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[9px] px-3 h-6">Stable Academic Flow</Badge>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}

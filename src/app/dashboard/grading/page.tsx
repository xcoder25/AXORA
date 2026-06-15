'use client';

import { useState } from 'react';
import { provideAutomatedAssignmentFeedback, type ProvideAutomatedAssignmentFeedbackOutput } from '@/ai/flows/provide-automated-assignment-feedback-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, AlertCircle, FileText, Sparkles, BarChart3,
  TrendingUp, TrendingDown, Brain, Users, Star, Target, Download, RefreshCw,
  GraduationCap, BookOpen, Activity, ChevronRight, Clipboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
const STUDENT_PERFORMANCE = [
  { name: 'Alice Johnson', id: 'STU-0021', avg: 91, trend: +5, status: 'Excellent', subjects: [95, 88, 92, 87, 94] },
  { name: 'Brian Okafor', id: 'STU-0034', avg: 78, trend: -2, status: 'Good', subjects: [80, 75, 82, 70, 84] },
  { name: 'Chioma Nweke', id: 'STU-0047', avg: 65, trend: +8, status: 'Satisfactory', subjects: [60, 68, 70, 62, 65] },
  { name: 'David Eze', id: 'STU-0058', avg: 52, trend: -6, status: 'Needs Improvement', subjects: [55, 48, 52, 50, 55] },
  { name: 'Emeka Adeyemi', id: 'STU-0063', avg: 88, trend: +3, status: 'Good', subjects: [90, 85, 92, 82, 90] },
];

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Civics'];

const CLASS_GRADES = [
  { grade: 'A (90–100)', count: 12, pct: 24, color: '#22c55e' },
  { grade: 'B (80–89)', count: 18, pct: 36, color: '#6366f1' },
  { grade: 'C (70–79)', count: 11, pct: 22, color: '#3b82f6' },
  { grade: 'D (60–69)', count: 6, pct: 12, color: '#f59e0b' },
  { grade: 'F (<60)', count: 3, pct: 6, color: '#ef4444' },
];

// ─── Grade Distribution Bar ──────────────────────────────────────────────────
function GradeBar({ grade, count, pct, color }: { grade: string; count: number; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-bold text-white/50 w-20 shrink-0">{grade}</span>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
      <span className="text-xs font-bold text-white w-6 text-right">{count}</span>
      <span className="text-[9px] text-white/30 w-8">{pct}%</span>
    </div>
  );
}

// ─── Subject Radar (simple bar version) ──────────────────────────────────────
function SubjectMasteryChart({ scores }: { scores: number[] }) {
  return (
    <div className="space-y-2.5">
      {SUBJECTS.map((sub, i) => {
        const score = scores[i];
        const color = score >= 85 ? '#22c55e' : score >= 70 ? '#6366f1' : score >= 55 ? '#f59e0b' : '#ef4444';
        return (
          <div key={sub} className="flex items-center gap-3">
            <span className="text-[9px] text-white/50 w-20 shrink-0">{sub}</span>
            <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${score}%`, background: color }} />
            </div>
            <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────
function ReportCard({ student }: { student: typeof STUDENT_PERFORMANCE[0] }) {
  const remarks: Record<string, string> = {
    Excellent: 'An outstanding student who consistently demonstrates exceptional dedication and academic excellence. Continue this commendable performance!',
    Good: 'A diligent student with solid academic performance. Focus on Mathematics to further strengthen overall standing.',
    Satisfactory: 'Showing noticeable improvement this term. Continued effort in reading comprehension will yield further gains.',
    'Needs Improvement': 'Student requires targeted intervention. Recommend teacher conference and additional tutoring sessions.',
  };
  const statusColor: Record<string, string> = {
    Excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Good: 'bg-primary/10 text-primary border-primary/30',
    Satisfactory: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Needs Improvement': 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <div className="glass-card-premium rounded-3xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-black text-white text-lg">
            {student.name[0]}
          </div>
          <div>
            <p className="font-bold text-white">{student.name}</p>
            <p className="text-[9px] font-mono text-white/30">{student.id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">{student.avg}<span className="text-sm text-white/30">%</span></p>
          <Badge className={cn('text-[8px] font-black border', statusColor[student.status])}>{student.status}</Badge>
        </div>
      </div>
      {/* Subject breakdown */}
      <SubjectMasteryChart scores={student.subjects} />
      {/* Remark */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <p className="text-[9px] font-black uppercase tracking-wider text-primary mb-1.5">Teacher Remark</p>
        <p className="text-[10px] text-white/60 leading-relaxed italic">"{remarks[student.status]}"</p>
      </div>
      <Button className="w-full h-9 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
        <Download className="mr-2 h-3.5 w-3.5" /> Export Report Card
      </Button>
    </div>
  );
}

// ─── Grading Feedback Section ─────────────────────────────────────────────────
function getBadgeStyles(category: string) {
  switch (category) {
    case 'Excellent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Good': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Satisfactory': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Needs Improvement': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'Unsatisfactory': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400';
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GradingPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<ProvideAutomatedAssignmentFeedbackOutput | null>(null);
  const [activeTab, setActiveTab] = useState('ai-grading');
  const [selectedStudent, setSelectedStudent] = useState(STUDENT_PERFORMANCE[0]);

  async function handleGrade(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await provideAutomatedAssignmentFeedback({
        assignmentPrompt: formData.get('assignmentPrompt') as string,
        studentSubmission: formData.get('studentSubmission') as string,
      });
      setFeedback(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">
            <Brain className="mr-1 h-3 w-3" /> Academic Engine v2
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            Grading & Analytics
          </h2>
          <p className="text-muted-foreground max-w-xl">AI semantic grading, class performance analytics, report cards, and subject mastery maps.</p>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Class Average', value: '74.8%', icon: Target, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
          { label: 'Top Performer', value: '91%', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Pass Rate', value: '88.5%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'At Risk', value: '3', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
                <p className="text-xl font-black text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Tabs ────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card border-white/5 p-1.5 rounded-2xl h-auto gap-1 flex flex-wrap">
          {[
            { value: 'ai-grading', label: 'AI Grading', icon: Sparkles },
            { value: 'performance', label: 'Class Performance', icon: BarChart3 },
            { value: 'report-cards', label: 'Report Cards', icon: FileText },
            { value: 'mastery', label: 'Subject Mastery', icon: Target },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}
              className="rounded-xl font-black uppercase tracking-widest text-[8px] px-3 py-2 flex items-center gap-1.5 data-[state=active]:bg-primary/20">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── AI Grading Tab ──────────────────────────────── */}
        <TabsContent value="ai-grading" className="mt-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <form onSubmit={handleGrade} className="space-y-4">
                <Card className="glass-card border-white/5">
                  <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">Semantic Analysis Engine</span>
                    </div>
                    <CardTitle className="text-xl text-white">AI Grading Assistant</CardTitle>
                    <CardDescription className="text-xs">Paste any assignment and student response for instant AI evaluation.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Assignment Prompt</Label>
                      <Textarea name="assignmentPrompt" placeholder="Paste the original question or rubric..."
                        className="min-h-[80px] rounded-xl border-white/10 bg-white/5 text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Student Response</Label>
                      <Textarea name="studentSubmission" placeholder="Paste student's submission here..."
                        className="min-h-[200px] rounded-xl border-white/10 bg-white/5 text-sm" required />
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button type="submit" className="w-full h-11 rounded-xl font-black shadow-xl shadow-primary/20" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Run Semantic Audit</>}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>

            <div className="lg:col-span-7">
              {!feedback && !loading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-12 border-2 border-dashed rounded-3xl bg-white/[0.02] border-white/5">
                  <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                    <Brain className="h-8 w-8 text-primary/40 neural-pulse" />
                  </div>
                  <h3 className="font-headline text-xl font-bold text-white">Awaiting Submission</h3>
                  <p className="text-white/30 text-sm max-w-xs mt-2">Submit an assignment to receive AI-powered semantic feedback and grade evaluation.</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6 bg-white/[0.02] rounded-3xl border border-white/5">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">Axora is auditing...</p>
                    <p className="text-xs text-white/30 mt-1">Analyzing context, tone, logic, and argument structure</p>
                  </div>
                </div>
              )}
              {feedback && (
                <Card className="glass-card border-white/5 animate-in zoom-in-95 duration-500 h-full">
                  <CardHeader className="flex flex-row items-center justify-between bg-white/5 border-b border-white/5 p-6">
                    <div className="space-y-1">
                      <CardTitle className="text-xl text-white">Evaluation Report</CardTitle>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Semantic Audit Complete</p>
                    </div>
                    <Badge variant="outline" className={cn('px-4 py-1.5 text-[10px] font-black rounded-xl border-2', getBadgeStyles(feedback.suggestedGradeCategory))}>
                      {feedback.suggestedGradeCategory}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="relative pl-5 border-l-2 border-primary/30">
                      <h4 className="text-[9px] font-black uppercase tracking-widest mb-2 text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Executive Verdict
                      </h4>
                      <p className="text-sm font-medium leading-relaxed text-white/90 italic">
                        "{feedback.overallFeedback}"
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5" /> Growth Matrix
                      </h4>
                      {feedback.areasForImprovement.map((area, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background font-black text-[10px] text-accent border border-white/5">{i + 1}</span>
                          <p className="text-xs leading-relaxed text-white/60">{area}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Performance Tab ─────────────────────────────── */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Grade distribution */}
            <Card className="glass-card border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Grade Distribution
                </CardTitle>
                <CardDescription className="text-[10px]">Class of 50 students — current term</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {CLASS_GRADES.map(g => <GradeBar key={g.grade} {...g} />)}
              </CardContent>
            </Card>

            {/* Student ranking */}
            <Card className="glass-card border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Student Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {STUDENT_PERFORMANCE.sort((a, b) => b.avg - a.avg).map((stu, i) => (
                  <div key={stu.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black',
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-slate-400/20 text-slate-300' :
                      i === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-white/5 text-white/40'
                    )}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{stu.name}</p>
                      <p className="text-[9px] text-white/30">{stu.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{stu.avg}%</p>
                      <div className={cn('flex items-center gap-0.5 text-[9px] font-bold justify-end',
                        stu.trend > 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {stu.trend > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {Math.abs(stu.trend)}%
                      </div>
                    </div>
                    <Badge className={cn('text-[7px] font-black border-none ml-2',
                      stu.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                      stu.status === 'Good' ? 'bg-primary/10 text-primary' :
                      stu.status === 'Satisfactory' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    )}>{stu.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Report Cards Tab ────────────────────────────── */}
        <TabsContent value="report-cards" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Select Student</p>
              {STUDENT_PERFORMANCE.map(stu => (
                <button key={stu.id} onClick={() => setSelectedStudent(stu)}
                  className={cn('w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                    selectedStudent.id === stu.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  )}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-black text-white text-sm">
                      {stu.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{stu.name}</p>
                      <p className="text-[9px] text-white/30">{stu.id}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-white">{stu.avg}%</p>
                </button>
              ))}
            </div>
            <ReportCard student={selectedStudent} />
          </div>
        </TabsContent>

        {/* ── Subject Mastery Tab ─────────────────────────── */}
        <TabsContent value="mastery" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STUDENT_PERFORMANCE.map(stu => (
              <Card key={stu.id} className="glass-card border-white/5">
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-black text-white">
                      {stu.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-sm text-white">{stu.name}</CardTitle>
                      <p className="text-[9px] text-white/30">{stu.avg}% avg</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <SubjectMasteryChart scores={stu.subjects} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
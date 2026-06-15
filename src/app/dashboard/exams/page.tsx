'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ClipboardList, Brain, Sparkles, Plus, Play, Pause, AlertTriangle, Users,
  Clock, CheckCircle2, ChevronRight, FileText, Database, ShieldCheck, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ───────────────────────────────────────────────────────────────────
const EXAMS = [
  { id: 'EXM-100', title: 'Mathematics Mid-Term', grade: 'SSS-3', questions: 40, duration: '60 mins', status: 'active', participants: 142 },
  { id: 'EXM-099', title: 'Physics Fundamentals', grade: 'SSS-1', questions: 25, duration: '45 mins', status: 'draft', participants: 0 },
  { id: 'EXM-098', title: 'Civic Education Quiz', grade: 'JSS-3', questions: 15, duration: '20 mins', status: 'completed', participants: 85 },
];

const QUESTION_BANK = [
  { id: 'Q-402', subject: 'Mathematics', text: 'Solve for x: 2x + 5 = 15', diff: 'Easy' },
  { id: 'Q-401', subject: 'Physics', text: 'Calculate the velocity of an object falling for 3s under gravity.', diff: 'Medium' },
  { id: 'Q-400', subject: 'Biology', text: 'Explain the process of cellular respiration in mitochondria.', diff: 'Hard' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CBTExamsPage() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 font-black uppercase tracking-widest text-[9px]">
            <Brain className="mr-1 h-3 w-3" /> AXIOM Synthesizer
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            CBT Exam Engine
          </h2>
          <p className="text-muted-foreground max-w-xl">
            AI-powered question generation, secure proctored examination environments, and instant grading.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-xl shadow-fuchsia-500/20"
            onClick={() => setActiveTab('create')}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Generate Exam
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: '1', icon: Play, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Questions in Bank', value: '4,285', icon: Database, color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' },
          { label: 'Exams Completed', value: '342', icon: CheckCircle2, color: 'text-primary bg-primary/10 border-primary/20' },
          { label: 'Proctoring Flags', value: '2', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center shrink-0', stat.color)}>
                <stat.icon className="h-4 w-4" />
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
        <TabsList className="glass-card border-white/5 p-1.5 rounded-2xl h-auto gap-1">
          {[
            { value: 'active', label: 'Exam Dashboard', icon: ClipboardList },
            { value: 'create', label: 'AI Generator', icon: Sparkles },
            { value: 'bank', label: 'Question Bank', icon: Database },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}
              className="rounded-xl font-black uppercase tracking-widest text-[8px] px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-400">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Exam Dashboard Tab ─────────────────────────── */}
        <TabsContent value="active" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {EXAMS.map(exam => {
              const isActive = exam.status === 'active';
              return (
                <Card key={exam.id} className={cn('glass-card transition-all group overflow-hidden relative',
                  isActive ? 'border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.1)]' : 'border-white/5 hover:border-white/10'
                )}>
                  {isActive && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 to-purple-600" />}
                  <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.02]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border',
                          isActive ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' : 'bg-white/5 border-white/10 text-white/50'
                        )}>
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm text-white font-bold">{exam.title}</CardTitle>
                          <p className="text-[10px] text-white/40">{exam.id} • {exam.grade}</p>
                        </div>
                      </div>
                      <Badge className={cn('text-[7px] font-black uppercase border-none',
                        isActive ? 'bg-emerald-500/20 text-emerald-400' :
                        exam.status === 'draft' ? 'bg-white/10 text-white/50' : 'bg-blue-500/20 text-blue-400'
                      )}>{exam.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <HelpCircle className="h-3 w-3" /> Questions
                      </p>
                      <p className="text-lg font-black text-white">{exam.questions}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" /> Duration
                      </p>
                      <p className="text-lg font-black text-white">{exam.duration}</p>
                    </div>
                    {isActive && (
                      <div className="col-span-2 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                            <Users className="h-3 w-3" /> Active Candidates
                          </p>
                          <p className="text-sm font-black text-white">{exam.participants}</p>
                        </div>
                        <Button size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase bg-fuchsia-600 hover:bg-fuchsia-700">
                          Monitor <ShieldCheck className="ml-1.5 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── AI Generator Tab ───────────────────────────── */}
        <TabsContent value="create" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="glass-card border-fuchsia-500/20 lg:col-span-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/5 to-transparent pointer-events-none" />
              <CardHeader className="border-b border-white/5 p-6 bg-white/[0.02] relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-fuchsia-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400">AXIOM Neural Architecture</span>
                </div>
                <CardTitle className="text-xl text-white">Generative Assessment Builder</CardTitle>
                <CardDescription className="text-xs">Paste syllabus content or learning objectives to automatically generate a multi-choice exam.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5 relative z-10">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Exam Title</Label>
                    <Input placeholder="E.g. Biology Term 1 Final" className="bg-white/5 border-white/10 rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Target Grade Level</Label>
                    <Select defaultValue="sss1">
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jss1">JSS-1</SelectItem>
                        <SelectItem value="jss2">JSS-2</SelectItem>
                        <SelectItem value="jss3">JSS-3</SelectItem>
                        <SelectItem value="sss1">SSS-1</SelectItem>
                        <SelectItem value="sss2">SSS-2</SelectItem>
                        <SelectItem value="sss3">SSS-3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Number of Questions</Label>
                    <Input type="number" defaultValue="20" className="bg-white/5 border-white/10 rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Difficulty Profile</Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy (Fundamentals)</SelectItem>
                        <SelectItem value="balanced">Balanced (Standard curve)</SelectItem>
                        <SelectItem value="hard">Hard (Advanced analytical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Source Material / Syllabus / Context</Label>
                  <Textarea placeholder="Paste textbook chapter text, curriculum bullet points, or lecture notes here. AXIOM will extract key concepts and generate distinct multiple-choice questions with credible distractors..." className="min-h-[160px] bg-white/5 border-white/10 rounded-xl resize-none text-sm leading-relaxed" />
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t border-white/5 gap-3 relative z-10">
                <Button className="w-full h-11 rounded-xl font-black text-sm uppercase tracking-widest bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-xl shadow-fuchsia-500/20">
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Exam Framework
                </Button>
              </CardFooter>
            </Card>

            <div className="lg:col-span-4 space-y-6">
              <Card className="glass-card border-white/5 bg-black/40 h-full flex flex-col items-center justify-center p-8 text-center border-dashed border-2">
                <div className="h-16 w-16 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-fuchsia-400 neural-pulse" />
                </div>
                <h3 className="text-xl font-black text-white">Waiting for Input</h3>
                <p className="text-xs text-white/40 mt-2 max-w-xs leading-relaxed">
                  Once generated, preview questions here before saving them to the bank or launching the exam.
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Question Bank Tab ──────────────────────────── */}
        <TabsContent value="bank" className="mt-6">
          <Card className="glass-card border-white/5">
            <CardHeader className="border-b border-white/5 p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-fuchsia-400" /> Global Question Repository
                </CardTitle>
              </div>
              <Button size="sm" className="h-8 rounded-xl text-[9px] font-black uppercase bg-white/10 hover:bg-white/20 text-white">
                <Plus className="mr-1.5 h-3 w-3" /> Add Question
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {QUESTION_BANK.map(q => (
                  <div key={q.id} className="p-4 flex gap-4 hover:bg-white/[0.02]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge className="bg-white/5 text-white/50 border-none text-[8px] font-black uppercase tracking-widest">{q.subject}</Badge>
                        <Badge className={cn('border-none text-[8px] font-black uppercase tracking-widest',
                          q.diff === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                          q.diff === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        )}>{q.diff}</Badge>
                      </div>
                      <p className="text-sm font-medium text-white">{q.text}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-white/30 font-mono mb-2">{q.id}</p>
                      <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase text-fuchsia-400 hover:bg-fuchsia-500/10">
                        Edit <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
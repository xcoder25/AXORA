'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap, Plus, Play, Pause, CheckCircle2, Clock, AlertTriangle, Trash2,
  ChevronRight, ArrowRight, MessageSquare, DollarSign, Camera, ClipboardList,
  Users, Bell, Activity, Settings, Sparkles, Edit3, History,
  Calendar, MailCheck, PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'draft';
  runs: number;
  lastRun: string;
  icon: any;
  color: string;
};

type LogEntry = {
  id: string;
  workflowName: string;
  event: string;
  result: 'success' | 'failed' | 'pending';
  time: string;
};

// ─── Sample Data ──────────────────────────────────────────────────────────────
const WORKFLOWS: Workflow[] = [
  {
    id: 'wf-001', name: 'Absence Alert',
    trigger: 'Student absent 2+ consecutive days',
    action: 'Notify guardian via WhatsApp + create attendance alert',
    status: 'active', runs: 247, lastRun: '2 hours ago',
    icon: Camera, color: 'text-primary bg-primary/10 border-primary/20'
  },
  {
    id: 'wf-002', name: 'Fee Reminder',
    trigger: 'Outstanding balance > 30 days',
    action: 'Send SMS reminder to parent + email to admin',
    status: 'active', runs: 89, lastRun: '1 day ago',
    icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'wf-003', name: 'Exam Notification',
    trigger: '24 hours before exam session',
    action: 'Broadcast reminder to all enrolled students',
    status: 'active', runs: 34, lastRun: '3 days ago',
    icon: ClipboardList, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'wf-004', name: 'New Student Onboard',
    trigger: 'New student added to registry',
    action: 'Generate ID card + send welcome email + create fee record',
    status: 'active', runs: 156, lastRun: '5 hours ago',
    icon: Users, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
  },
  {
    id: 'wf-005', name: 'Security Alert Escalation',
    trigger: 'Flagged identity detected on camera',
    action: 'Alert security team + lock affected zone + notify admin',
    status: 'paused', runs: 12, lastRun: '1 week ago',
    icon: AlertTriangle, color: 'text-red-400 bg-red-500/10 border-red-500/20'
  },
  {
    id: 'wf-006', name: 'Monthly Finance Report',
    trigger: 'First of every month',
    action: 'Generate P&L report + email to board + update NEXORA analytics',
    status: 'draft', runs: 0, lastRun: 'Never',
    icon: Activity, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
];

const TEMPLATES = [
  {
    name: 'Absence Alert', icon: Camera, desc: 'Notify guardians when students miss class',
    trigger: 'Attendance', action: 'WhatsApp/SMS', uses: '312 schools'
  },
  {
    name: 'Fee Reminder Chain', icon: DollarSign, desc: 'Multi-step reminder for outstanding balances',
    trigger: 'Finance', action: 'SMS + Email', uses: '208 schools'
  },
  {
    name: 'Exam Day Broadcast', icon: ClipboardList, desc: 'Remind all students 24h before exam',
    trigger: 'Schedule', action: 'Push + Email', uses: '167 schools'
  },
  {
    name: 'New Enrolment Welcome', icon: Users, desc: 'Onboard new students automatically',
    trigger: 'Registry', action: 'Email + ID + Fee', uses: '143 schools'
  },
  {
    name: 'Weekly Performance Summary', icon: Activity, desc: 'Send teachers their class analytics',
    trigger: 'Schedule', action: 'Email Report', uses: '98 schools'
  },
  {
    name: 'Debt Escalation Ladder', icon: AlertTriangle, desc: 'Auto-escalate unpaid accounts step by step',
    trigger: 'Finance', action: 'Call + Legal', uses: '76 schools'
  },
];

const EXECUTION_LOG: LogEntry[] = [
  { id: 'log-1', workflowName: 'Absence Alert', event: 'STU-0034 absent Day 2 → Notified Mrs. Okafor (WhatsApp)', result: 'success', time: '2h ago' },
  { id: 'log-2', workflowName: 'New Student Onboard', event: 'STU-1289 added → ID card queued, fee record created', result: 'success', time: '5h ago' },
  { id: 'log-3', workflowName: 'Fee Reminder', event: '3 accounts triggered → SMS dispatch failed for 1 number', result: 'failed', time: '1d ago' },
  { id: 'log-4', workflowName: 'Exam Notification', event: 'Mathematics Mid-Term → 45 students notified', result: 'success', time: '3d ago' },
  { id: 'log-5', workflowName: 'Monthly Finance Report', event: 'June 2026 report → Generating...', result: 'pending', time: 'Now' },
];

// ─── Workflow Card ────────────────────────────────────────────────────────────
function WorkflowCard({ wf, onToggle }: { wf: Workflow; onToggle: (id: string) => void }) {
  const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    paused: { label: 'Paused', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    draft: { label: 'Draft', color: 'bg-white/5 text-white/40 border-white/10' },
  };
  const cfg = statusConfig[wf.status];

  return (
    <div className="glass-card-premium rounded-2xl p-5 space-y-4 group hover:border-white/15 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', wf.color)}>
            <wf.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{wf.name}</p>
            <Badge className={cn('text-[7px] font-black border', cfg.color)}>{cfg.label}</Badge>
          </div>
        </div>
        <Switch
          checked={wf.status === 'active'}
          onCheckedChange={() => onToggle(wf.id)}
          className="shrink-0"
        />
      </div>

      {/* Trigger → Action flow */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-[10px]">
          <span className="font-black uppercase tracking-wider text-white/30 w-12 shrink-0 pt-0.5">IF</span>
          <p className="text-white/60 leading-relaxed">{wf.trigger}</p>
        </div>
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-white/10" />
          <ArrowRight className="h-3 w-3 text-white/20" />
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="flex items-start gap-2 text-[10px]">
          <span className="font-black uppercase tracking-wider text-primary/60 w-12 shrink-0 pt-0.5">THEN</span>
          <p className="text-white/60 leading-relaxed">{wf.action}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px]">
        <span className="text-white/30"><span className="font-bold text-white/60">{wf.runs}</span> runs</span>
        <span className="text-white/30">Last: <span className="text-white/50">{wf.lastRun}</span></span>
        <Button variant="ghost" size="sm" className="h-6 rounded-lg text-[8px] font-bold text-primary hover:bg-primary/10 px-2">
          <Edit3 className="mr-1 h-2.5 w-2.5" /> Edit
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(WORKFLOWS);
  const [activeTab, setActiveTab] = useState('workflows');
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newName, setNewName] = useState('');

  const handleToggle = (id: string) => {
    setWorkflows(prev => prev.map(wf =>
      wf.id === id
        ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' }
        : wf
    ));
  };

  const activeCount = workflows.filter(w => w.status === 'active').length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.runs, 0);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">
            <Zap className="mr-1 h-3 w-3" /> Automation Engine v2
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            Smart Workflows
          </h2>
          <p className="text-muted-foreground max-w-xl">If-then automation engine — create, manage, and track campus-wide intelligent triggers.</p>
        </div>
        <Button className="rounded-xl h-11 px-6 font-black shadow-xl shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Workflows', value: activeCount, icon: Zap, color: 'text-primary bg-primary/10 border-primary/20' },
          { label: 'Total Executions', value: totalRuns, icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'This Week', value: '84', icon: Calendar, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Success Rate', value: '97.8%', icon: CheckCircle2, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
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
            { value: 'workflows', label: 'My Workflows', icon: Zap },
            { value: 'builder', label: 'Create New', icon: Plus },
            { value: 'templates', label: 'Templates', icon: Sparkles },
            { value: 'history', label: 'Execution Log', icon: History },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}
              className="rounded-xl font-black uppercase tracking-widest text-[8px] px-3 py-2 flex items-center gap-1.5 data-[state=active]:bg-primary/20">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Workflows List ──────────────────────────────── */}
        <TabsContent value="workflows" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map(wf => (
              <WorkflowCard key={wf.id} wf={wf} onToggle={handleToggle} />
            ))}
          </div>
        </TabsContent>

        {/* ── Builder ────────────────────────────────────── */}
        <TabsContent value="builder" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card border-white/5">
              <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Workflow Builder</span>
                </div>
                <CardTitle className="text-xl text-white">Create Automation</CardTitle>
                <CardDescription className="text-xs">Define an if-then trigger to automate a campus process.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Workflow Name</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Absence Escalation"
                    className="bg-white/5 border-white/10 rounded-xl h-11" />
                </div>

                {/* Trigger */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    <span className="text-primary">IF</span> — Trigger Event
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                      <SelectValue placeholder="Select trigger condition..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absence">Student absent N consecutive days</SelectItem>
                      <SelectItem value="payment-due">Fee balance overdue N days</SelectItem>
                      <SelectItem value="exam-start">Exam session starts in N hours</SelectItem>
                      <SelectItem value="new-student">New student added to registry</SelectItem>
                      <SelectItem value="security-flag">Flagged identity detected</SelectItem>
                      <SelectItem value="scheduled">Recurring schedule (cron)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition details */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Condition Value</Label>
                  <Input value={newTrigger} onChange={e => setNewTrigger(e.target.value)}
                    placeholder="e.g. 2 days, 30 days, JSS-3..."
                    className="bg-white/5 border-white/10 rounded-xl h-11" />
                </div>

                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Action */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    <span className="text-emerald-400">THEN</span> — Automated Action
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                      <SelectValue placeholder="Select action to perform..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">Send WhatsApp message</SelectItem>
                      <SelectItem value="sms">Send SMS</SelectItem>
                      <SelectItem value="email">Send Email</SelectItem>
                      <SelectItem value="announcement">Post campus announcement</SelectItem>
                      <SelectItem value="alert">Trigger security alert</SelectItem>
                      <SelectItem value="report">Generate and send report</SelectItem>
                      <SelectItem value="record">Create finance record</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Action Details / Message</Label>
                  <Input value={newAction} onChange={e => setNewAction(e.target.value)}
                    placeholder="e.g. Dear Parent, your child has been absent..."
                    className="bg-white/5 border-white/10 rounded-xl h-11" />
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t border-white/5 gap-3">
                <Button variant="outline" className="flex-1 h-11 rounded-xl border-white/10 bg-white/5 font-bold text-[10px] uppercase tracking-widest">
                  Save as Draft
                </Button>
                <Button className="flex-1 h-11 rounded-xl font-black shadow-lg shadow-primary/20 text-[10px] uppercase tracking-widest">
                  <Zap className="mr-2 h-4 w-4" /> Activate Workflow
                </Button>
              </CardFooter>
            </Card>

            {/* Preview */}
            <Card className="glass-card border-white/5 flex flex-col">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center p-8">
                <div className="w-full space-y-4">
                  {/* Trigger node */}
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">TRIGGER</p>
                    <p className="text-sm font-bold text-white">{newTrigger || 'Select a trigger event...'}</p>
                  </div>
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-px h-6 bg-white/20" />
                      <ArrowRight className="h-4 w-4 text-white/30 rotate-90" />
                      <div className="w-px h-6 bg-white/20" />
                    </div>
                  </div>
                  {/* Action node */}
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1">ACTION</p>
                    <p className="text-sm font-bold text-white">{newAction || 'Define the automated action...'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Templates ───────────────────────────────────── */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((tpl, i) => (
              <div key={i} className="glass-card-premium rounded-2xl p-5 space-y-3 group hover:border-white/15 transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <tpl.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[8px] text-white/25 font-bold">{tpl.uses}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{tpl.name}</p>
                  <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{tpl.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <Badge className="bg-white/5 text-white/40 border-white/10">{tpl.trigger}</Badge>
                  <ArrowRight className="h-3 w-3 text-white/20" />
                  <Badge className="bg-primary/10 text-primary border-primary/20">{tpl.action}</Badge>
                </div>
                <Button className="w-full h-9 rounded-xl text-[9px] font-black uppercase tracking-widest mt-2 shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-3.5 w-3.5" /> Use Template
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Execution History ───────────────────────────── */}
        <TabsContent value="history" className="mt-6">
          <Card className="glass-card border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Execution Log
              </CardTitle>
              <CardDescription className="text-[10px]">Full audit trail of every workflow execution across all modules.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {EXECUTION_LOG.map(log => {
                  const resultConfig = {
                    success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Success' },
                    failed: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Failed' },
                    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Running' },
                  };
                  const cfg = resultConfig[log.result];
                  const Icon = cfg.icon;
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-5 hover:bg-white/[0.03] transition-all">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border', cfg.bg, cfg.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">{log.workflowName}</p>
                        <p className="text-[10px] text-white/40 leading-relaxed mt-0.5">{log.event}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge className={cn('text-[8px] font-black border', cfg.bg, cfg.color)}>{cfg.label}</Badge>
                        <p className="text-[8px] text-white/25 mt-1">{log.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 p-4">
              <Button variant="ghost" className="w-full h-9 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl">
                Load More Logs <ChevronRight className="ml-2 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
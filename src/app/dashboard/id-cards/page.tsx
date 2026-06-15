'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IdCard, QrCode, Download, Printer, ShieldCheck, Sparkles, Filter, Users,
  Search, ScanLine, Camera, ChevronRight, Share2, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ───────────────────────────────────────────────────────────────────
const STUDENTS = [
  { id: 'STU-8821', name: 'Alice Johnson', role: 'Student', grade: 'JSS-3A', clearance: 'Level 1', bloodGroup: 'O+', expiry: 'Dec 2026', photo: 'AJ' },
  { id: 'STU-9045', name: 'Brian Okafor', role: 'Student', grade: 'SSS-1B', clearance: 'Level 1', bloodGroup: 'A+', expiry: 'Dec 2026', photo: 'BO' },
  { id: 'STU-7732', name: 'Chioma Nweke', role: 'Prefect', grade: 'SSS-3A', clearance: 'Level 2', bloodGroup: 'B+', expiry: 'Dec 2026', photo: 'CN' },
  { id: 'FAC-1004', name: 'Dr. Emeka Adeyemi', role: 'Faculty', grade: 'Science Dept', clearance: 'Level 4', bloodGroup: 'O-', expiry: 'Dec 2028', photo: 'EA' },
];

const BADGES = [
  { label: 'Honor Roll', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { label: 'Science Club', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { label: 'Prefect', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
];

// ─── ID Card Component ────────────────────────────────────────────────────────
function DigitalIDCard({ person, detailed = false }: { person: typeof STUDENTS[0], detailed?: boolean }) {
  const isFaculty = person.role === 'Faculty';
  const theme = isFaculty
    ? 'from-violet-900 via-indigo-900 to-slate-900 border-violet-500/50 shadow-violet-500/20'
    : person.role === 'Prefect'
    ? 'from-emerald-900 via-teal-900 to-slate-900 border-emerald-500/50 shadow-emerald-500/20'
    : 'from-slate-900 via-blue-900/40 to-slate-900 border-blue-500/30 shadow-blue-500/10';

  const accent = isFaculty ? 'text-violet-400' : person.role === 'Prefect' ? 'text-emerald-400' : 'text-blue-400';

  return (
    <div className={cn('relative overflow-hidden rounded-[2rem] border-2 bg-gradient-to-br shadow-2xl transition-all duration-500 group', theme)}>
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,#ffffff,transparent_60%)] pointer-events-none" />
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/5 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className={cn('h-6 w-6 rounded bg-white/10 flex items-center justify-center', accent)}>
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">AXORA <span className="opacity-50">Academy</span></span>
        </div>
        <Badge className={cn('text-[8px] font-black uppercase tracking-widest border-none',
          isFaculty ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-white')}>
          {person.role}
        </Badge>
      </div>

      {/* Body */}
      <div className="relative z-10 p-6 flex gap-5">
        <div className="shrink-0">
          <div className="h-28 w-24 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 flex items-center justify-center shadow-inner overflow-hidden relative">
            {/* Fake photo */}
            <span className="text-3xl font-black text-white/50 tracking-tighter">{person.photo}</span>
            <div className="absolute inset-0 scan-line-active opacity-50" />
          </div>
        </div>
        <div className="flex-1 pt-1">
          <p className={cn('text-[9px] font-black uppercase tracking-widest mb-1', accent)}>{person.id}</p>
          <h3 className="text-xl font-black text-white leading-tight mb-3">{person.name}</h3>

          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div>
              <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Department/Class</p>
              <p className="text-xs font-bold text-white mt-0.5">{person.grade}</p>
            </div>
            <div>
              <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Blood Group</p>
              <p className="text-xs font-bold text-white mt-0.5">{person.bloodGroup}</p>
            </div>
            <div>
              <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Security Level</p>
              <p className="text-xs font-bold text-white mt-0.5">{person.clearance}</p>
            </div>
            <div>
              <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Valid Until</p>
              <p className="text-xs font-bold text-white mt-0.5">{person.expiry}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges (Detailed view only) */}
      {detailed && !isFaculty && (
        <div className="relative z-10 px-6 pb-4 flex gap-2">
          {BADGES.map((b, i) => (
            <div key={i} className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/5', b.bg)} title={b.label}>
              <b.icon className={cn('h-3 w-3', b.color)} />
              <span className={cn('text-[8px] font-bold uppercase tracking-wider', b.color)}>{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer / QR */}
      <div className="relative z-10 px-6 py-4 bg-black/30 border-t border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-white/80 p-1 bg-white/10 rounded-lg" />
          <div>
            <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Neural Pass Active</p>
            <p className="text-[9px] font-mono text-white/60 mt-0.5 tracking-widest">{person.id.replace('-', '')}X</p>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DigitalIDPage() {
  const [activeTab, setActiveTab] = useState('cards');
  const [search, setSearch] = useState('');

  const filtered = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">
            <IdCard className="mr-1 h-3 w-3" /> Identity Matrix v2
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            Digital ID & Neural Pass
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Beautiful cryptographic digital IDs, QR-based access control, and mass-export printing queues.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-5 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10">
            <Printer className="mr-2 h-4 w-4" /> Bulk Print
          </Button>
          <Button className="rounded-xl h-11 px-5 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
            <ScanLine className="mr-2 h-4 w-4" /> Open Scanner
          </Button>
        </div>
      </div>

      {/* ── Main Tabs ────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card border-white/5 p-1.5 rounded-2xl h-auto gap-1">
          {[
            { value: 'cards', label: 'ID Card Directory', icon: Users },
            { value: 'scanner', label: 'QR Scanner Kiosk', icon: QrCode },
            { value: 'settings', label: 'Badge & Design Settings', icon: Sparkles },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}
              className="rounded-xl font-black uppercase tracking-widest text-[8px] px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-primary/20">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Directory Tab ──────────────────────────────── */}
        <TabsContent value="cards" className="mt-6 space-y-6">
          <div className="flex items-center justify-between glass-card p-2 rounded-2xl border-white/5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or STU-ID..."
                className="h-10 pl-10 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0"
              />
            </div>
            <div className="flex gap-2 pr-2">
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase text-white/50 hover:text-white hover:bg-white/10">
                <Filter className="mr-1.5 h-3 w-3" /> Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(student => (
              <DigitalIDCard key={student.id} person={student} detailed />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <Search className="h-12 w-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-bold">No identities found matching "{search}"</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Scanner Kiosk Tab ──────────────────────────── */}
        <TabsContent value="scanner" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="glass-card border-none lg:col-span-7 bg-black/40 h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#6366f1,transparent_70%)]" />

              {/* Scanning reticle */}
              <div className="relative w-72 h-72 border-2 border-primary/40 rounded-3xl flex items-center justify-center mb-8">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-3xl" />

                <ScanLine className="h-16 w-16 text-primary/50 scan-line-active" />
              </div>

              <h3 className="text-xl font-black text-white relative z-10">Scan Neural Pass QR</h3>
              <p className="text-white/40 text-sm mt-2 relative z-10">Hold digital or physical ID card up to the camera</p>

              <Button className="mt-8 rounded-xl bg-white/10 text-white hover:bg-white/20 relative z-10 font-bold text-xs">
                <Camera className="mr-2 h-4 w-4" /> Select Camera Device
              </Button>
            </Card>

            <div className="lg:col-span-5 space-y-6">
              <Card className="glass-card border-white/5 h-full">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> Recent Scans
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {[
                      { name: 'Chioma Nweke', id: 'STU-7732', time: 'Just now', status: 'Granted', node: 'Library Gate' },
                      { name: 'Unknown QR', id: 'ERR-INVALID', time: '5m ago', status: 'Denied', node: 'Main Gate' },
                      { name: 'Dr. Emeka Adeyemi', id: 'FAC-1004', time: '12m ago', status: 'Granted', node: 'Faculty Lounge' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.03]">
                        <div>
                          <p className={cn('text-xs font-bold', log.status === 'Denied' ? 'text-red-400' : 'text-white')}>{log.name}</p>
                          <p className="text-[9px] text-white/30 mt-0.5">{log.id} • {log.node}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={cn('text-[7px] font-black uppercase border-none',
                            log.status === 'Granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          )}>{log.status}</Badge>
                          <p className="text-[8px] text-white/30 mt-1">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Settings Tab ───────────────────────────────── */}
        <TabsContent value="settings" className="mt-6">
          <Card className="glass-card border-white/5 max-w-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xl text-white">ID Card Design System</CardTitle>
              <CardDescription className="text-xs">Customize the appearance of institutional digital IDs.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Card Themes</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border-2 border-primary bg-primary/10 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-white">Deep Matrix (Dark)</span>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between cursor-pointer hover:border-white/30">
                    <span className="text-xs font-bold text-white/70">Clean Ivory (Light)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Data Fields Displayed</p>
                <div className="space-y-2">
                  {['Blood Group', 'Emergency Contact', 'Bus Route', 'Allergies'].map(field => (
                    <div key={field} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-xs text-white">{field}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold uppercase text-white/30 hover:text-white">Toggle</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

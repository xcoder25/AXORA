'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Settings, Building2, ShieldCheck, Database, Bell, Palette, Cpu, Users,
  CreditCard, Sparkles, CheckCircle2, AlertTriangle, Key, HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GlobalSettingsPage() {
  const [activeTab, setActiveTab] = useState('institution');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">
            <Settings className="mr-1 h-3 w-3" /> System Configuration
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            Global Settings
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Configure institutional parameters, billing layers, API integrations, and security protocols.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10">
            Discard Changes
          </Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-xl h-11 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">

        {/* ── Sidebar Navigation ─────────────────────────── */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'institution', label: 'Institutional Profile', icon: Building2 },
            { id: 'ai', label: 'AXIOM AI Engine', icon: Cpu },
            { id: 'security', label: 'Security & Access', icon: ShieldCheck },
            { id: 'billing', label: 'Billing & Gateway', icon: CreditCard },
            { id: 'appearance', label: 'Theme & Branding', icon: Palette },
            { id: 'database', label: 'Data Management', icon: Database },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm',
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
              )}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'ai' && <Badge className="ml-auto bg-violet-500/20 text-violet-400 border-none text-[7px] font-black uppercase">Pro</Badge>}
            </button>
          ))}
        </div>

        {/* ── Main Content Area ──────────────────────────── */}
        <div className="lg:col-span-9">
          
          {/* Institutional Profile */}
          {activeTab === 'institution' && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 p-6 bg-white/[0.02]">
                  <CardTitle className="text-xl text-white">Institutional Identity</CardTitle>
                  <CardDescription className="text-xs">Primary campus details displayed on reports, parent portals, and ID cards.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="h-24 w-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                      <span className="text-4xl">🎓</span>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Upload</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Institution Name</Label>
                      <Input defaultValue="AXORA Global Academy" className="bg-white/5 border-white/10 rounded-xl h-11 text-base font-bold text-white" />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Registration ID / Code</Label>
                      <Input defaultValue="AX-9921-EDU" className="bg-white/5 border-white/10 rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Primary Contact Email</Label>
                      <Input defaultValue="admin@axora.edu" className="bg-white/5 border-white/10 rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Campus Address</Label>
                      <Input defaultValue="144 Cybernetics Way, Neo-Victoria District" className="bg-white/5 border-white/10 rounded-xl h-11" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 p-6 bg-white/[0.02]">
                  <CardTitle className="text-xl text-white">Academic Calendar</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Current Academic Term</Label>
                    <Select defaultValue="term-2">
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="term-1">First Term (Sep - Dec)</SelectItem>
                        <SelectItem value="term-2">Second Term (Jan - Apr)</SelectItem>
                        <SelectItem value="term-3">Third Term (May - Jul)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Current Session Year</Label>
                    <Select defaultValue="2025">
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024 / 2025</SelectItem>
                        <SelectItem value="2025">2025 / 2026</SelectItem>
                        <SelectItem value="2026">2026 / 2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AXIOM AI Engine */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <Card className="glass-card border-violet-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none" />
                <CardHeader className="border-b border-white/5 p-6 bg-white/[0.02] relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-violet-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">Neural Configuration</span>
                  </div>
                  <CardTitle className="text-xl text-white">AXIOM & NEXORA Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 relative z-10">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-violet-500/30">
                    <div>
                      <p className="text-sm font-bold text-white">Enable Generative Grading</p>
                      <p className="text-[10px] text-white/50 max-w-sm mt-1">Allows the AI to semantically grade essays and provide automated feedback to students.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-violet-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                    <div>
                      <p className="text-sm font-bold text-white">Predictive Dropout Analysis</p>
                      <p className="text-[10px] text-white/50 max-w-sm mt-1">Analyzes attendance and grade trends to flag at-risk students automatically.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-violet-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                    <div>
                      <p className="text-sm font-bold text-white">NEXORA Daily Voice Briefings</p>
                      <p className="text-[10px] text-white/50 max-w-sm mt-1">Synthesizes TTS morning intelligence reports for administrators.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-violet-500" />
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-violet-400">LLM Provider</Label>
                    <Select defaultValue="gemini">
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini 1.5 Pro (Recommended)</SelectItem>
                        <SelectItem value="gpt4">OpenAI GPT-4o</SelectItem>
                        <SelectItem value="claude">Anthropic Claude 3.5 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security & Access */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 p-6 bg-white/[0.02]">
                  <CardTitle className="text-xl text-white">Authentication & Access</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-sm font-bold text-white">Require Two-Factor Auth (2FA)</p>
                      <p className="text-[10px] text-white/50 mt-1">Mandatory for all Administrator and Teacher accounts.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-sm font-bold text-white">IP Geofencing</p>
                      <p className="text-[10px] text-white/50 mt-1">Restrict admin dashboard access to campus IP ranges only.</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 p-6 bg-white/[0.02]">
                  <CardTitle className="text-xl text-white">API Keys & Tokens</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Firebase Web API Key</Label>
                    <div className="flex gap-2">
                      <Input type="password" defaultValue="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxx" className="bg-white/5 border-white/10 rounded-xl h-11 font-mono text-xs" />
                      <Button variant="outline" className="h-11 rounded-xl bg-white/5 border-white/10 font-bold text-[10px] uppercase">Reveal</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

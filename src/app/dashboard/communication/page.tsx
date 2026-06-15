'use client';

import { useState } from 'react';
import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Megaphone, MessageSquare, Send, Bell, Mail, Smartphone, Sparkles, Filter,
  AlertTriangle, Users, BookOpen, Clock, Activity, CheckCircle2, ChevronRight,
  Bold, Italic, Link as LinkIcon, Image as ImageIcon, HeartHandshake
} from 'lucide-react';
import { isStaffRole } from '@/lib/roles';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';
import { formatRelativeTime } from '@/lib/format-time';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';

export default function CommunicationPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);

  const [activeTab, setActiveTab] = useState('broadcast');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('All Students');
  const [channel, setChannel] = useState<'push' | 'email' | 'sms'>('push');
  const [isEmergency, setIsEmergency] = useState(false);

  const announcementsQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null;
    return query(
      collection(db, 'announcements'),
      where('schoolId', '==', profile.schoolId),
      orderBy('createdAt', 'desc'),
      limit(24)
    );
  }, [db, profile?.schoolId]);

  const { data: announcements, loading: listLoading } = useCollection(announcementsQuery);
  const isAdminOrTeacher = isStaffRole(profile?.role);

  const handleDispatch = async () => {
    if (!db || !profile?.schoolId || !user || !title.trim() || !content.trim()) return;
    if (!isAdminOrTeacher) {
      alert('Only administrators and faculty can dispatch announcements.');
      return;
    }

    startAxoraLoading(isEmergency ? 'Triggering Emergency Broadcast...' : 'Dispatching campus broadcast…');
    try {
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        content: content.trim(),
        schoolId: profile.schoolId,
        sender: profile.displayName || user.email?.split('@')[0] || 'Administration',
        senderUid: user.uid,
        targetRole,
        channel,
        priority: isEmergency ? 'emergency' : 'normal',
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setIsEmergency(false);
      setActiveTab('history');
    } catch {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'announcements',
          operation: 'create',
        })
      );
    } finally {
      stopAxoraLoading();
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">
            <Megaphone className="mr-1 h-3 w-3" /> Communication Hub v2
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            Campus Broadcasting
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Rich message composer, multi-channel dispatch, emergency alerts, and parent portal communications.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="destructive" className="rounded-xl h-11 px-6 font-black uppercase tracking-widest shadow-xl shadow-red-500/20 text-[10px]"
            onClick={() => { setActiveTab('broadcast'); setIsEmergency(true); }}>
            <AlertTriangle className="mr-2 h-4 w-4" /> Emergency Alert
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Broadcasts Sent', value: announcements?.length || 0, icon: Send, color: 'text-primary bg-primary/10 border-primary/20' },
          { label: 'Delivery Rate', value: '99.8%', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Active Parents', value: '842', icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Unread Messages', value: '12', icon: MessageSquare, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
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
        <TabsList className="glass-card border-white/5 p-1.5 rounded-2xl h-auto gap-1 flex flex-wrap">
          {[
            { value: 'broadcast', label: 'New Broadcast', icon: Megaphone },
            { value: 'history', label: 'Broadcast History', icon: Clock },
            { value: 'parents', label: 'Parent Portal', icon: HeartHandshake },
            { value: 'newsfeed', label: 'Campus News Feed', icon: Activity },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}
              className="rounded-xl font-black uppercase tracking-widest text-[8px] px-3 py-2 flex items-center gap-1.5 data-[state=active]:bg-primary/20">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Broadcast Composer Tab ─────────────────────── */}
        <TabsContent value="broadcast" className="mt-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Card className={cn('glass-card border-white/5 transition-colors duration-500', isEmergency ? 'border-red-500/30 bg-red-500/5' : '')}>
                <CardHeader className={cn('border-b border-white/5 p-6', isEmergency ? 'bg-red-500/10' : 'bg-primary/10')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className={cn('h-4 w-4 animate-pulse', isEmergency ? 'text-red-400' : 'text-primary')} />
                        <span className={cn('text-[9px] font-black uppercase tracking-widest', isEmergency ? 'text-red-400' : 'text-primary')}>
                          Rich Content Composer
                        </span>
                      </div>
                      <CardTitle className="text-xl text-white">{isEmergency ? 'Emergency Broadcast' : 'Compose Message'}</CardTitle>
                    </div>
                    {isEmergency && <Badge className="bg-red-500 text-white animate-pulse">EMERGENCY MODE</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-white">Emergency Broadcast</Label>
                      <p className="text-[10px] text-white/50">Overrides notification settings and sounds an alarm on mobile devices.</p>
                    </div>
                    <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Subject Line</Label>
                    <Input placeholder="E.g. Weekend Sports Postponement" value={title} onChange={e => setTitle(e.target.value)}
                      className={cn('bg-white/5 border-white/10 rounded-xl h-11 text-base font-bold', isEmergency ? 'text-red-400 placeholder:text-red-400/30 border-red-500/30' : '')} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Target Audience</Label>
                      <Select value={targetRole} onValueChange={setTargetRole}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Students">All Students</SelectItem>
                          <SelectItem value="Teachers & Students">Teachers & Faculty</SelectItem>
                          <SelectItem value="Parents">Parents Only</SelectItem>
                          <SelectItem value="All Roles">Entire Campus (All Roles)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Delivery Channel</Label>
                      <Select value={channel} onValueChange={(v: any) => setChannel(v)}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="push"><div className="flex items-center"><Bell className="mr-2 h-4 w-4" /> App Push Notification</div></SelectItem>
                          <SelectItem value="email"><div className="flex items-center"><Mail className="mr-2 h-4 w-4" /> Email Blast</div></SelectItem>
                          <SelectItem value="sms"><div className="flex items-center"><Smartphone className="mr-2 h-4 w-4" /> SMS Delivery</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Message Body</Label>
                    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden focus-within:border-primary/50 transition-colors">
                      {/* WYSIWYG Toolbar mock */}
                      <div className="flex items-center gap-1 border-b border-white/10 p-2 bg-white/5">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><Bold className="h-3.5 w-3.5 text-white/70" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><Italic className="h-3.5 w-3.5 text-white/70" /></Button>
                        <div className="w-px h-4 bg-white/20 mx-1" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><LinkIcon className="h-3.5 w-3.5 text-white/70" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><ImageIcon className="h-3.5 w-3.5 text-white/70" /></Button>
                      </div>
                      <Textarea placeholder="Type your message here..." value={content} onChange={e => setContent(e.target.value)}
                        className="min-h-[160px] border-0 rounded-none bg-transparent focus-visible:ring-0 text-white resize-none" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 border-t border-white/5 gap-3">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 border-white/10">
                    Save Draft
                  </Button>
                  <Button onClick={handleDispatch} disabled={!title.trim() || !content.trim()}
                    className={cn('flex-1 h-11 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl transition-all',
                      isEmergency ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                    )}>
                    <Send className="mr-2 h-4 w-4" /> Dispatch Now
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 p-4">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" /> Live Mobile Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 flex justify-center bg-black/40">
                  {/* Fake phone frame */}
                  <div className="w-[280px] h-[560px] rounded-[40px] border-8 border-white/10 bg-black relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 inset-x-0 h-6 bg-black flex justify-center z-20">
                      <div className="w-32 h-6 bg-black rounded-b-3xl" />
                    </div>
                    {/* Screen content */}
                    <div className="absolute inset-0 pt-12 p-4 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-950">
                      <div className={cn('w-full rounded-2xl p-4 backdrop-blur-xl border shadow-2xl animate-in slide-in-from-top-10 duration-500',
                        isEmergency ? 'bg-red-500/20 border-red-500/50' : 'bg-white/10 border-white/20'
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-white/70">AXORA Campus</span>
                          </div>
                          <span className="text-[9px] text-white/50">now</span>
                        </div>
                        <p className={cn('text-sm font-bold truncate', isEmergency ? 'text-red-400' : 'text-white')}>
                          {title || 'Message Subject Line'}
                        </p>
                        <p className="text-xs text-white/70 mt-1 line-clamp-3 leading-relaxed">
                          {content || 'Your message body will appear here. The preview updates in real-time as you type.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Broadcast History Tab ──────────────────────── */}
        <TabsContent value="history" className="mt-6">
          <Card className="glass-card border-white/5">
            <CardHeader className="border-b border-white/5 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">Broadcast History</CardTitle>
                <Button variant="outline" size="sm" className="h-8 rounded-xl text-[9px] font-black uppercase tracking-widest border-white/10 bg-white/5">
                  <Filter className="mr-2 h-3 w-3" /> Filter Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {listLoading ? (
                  <div className="p-12 text-center text-primary animate-pulse">Loading broadcast logs...</div>
                ) : announcements?.length === 0 ? (
                  <div className="p-12 text-center text-white/30">No broadcasts sent yet.</div>
                ) : (
                  announcements?.map((ann: any) => {
                    const isEmg = ann.priority === 'emergency';
                    const createdAt = (ann.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || ann.createdAt;
                    return (
                      <div key={ann.id} className="flex items-start gap-4 p-6 hover:bg-white/[0.03] transition-all group">
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                          isEmg ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-primary/10 border-primary/20 text-primary'
                        )}>
                          {ann.channel === 'email' ? <Mail className="h-4 w-4" /> : ann.channel === 'sms' ? <Smartphone className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={cn('text-sm font-bold truncate', isEmg ? 'text-red-400' : 'text-white')}>{ann.title}</p>
                            {isEmg && <Badge className="bg-red-500 text-white text-[8px] font-black h-4 uppercase">Emergency</Badge>}
                          </div>
                          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{ann.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                            <span>To: {ann.targetRole}</span>
                            <span>•</span>
                            <span>By: {ann.sender}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-white/40 font-mono">{formatRelativeTime(createdAt)}</p>
                          <Button variant="ghost" size="sm" className="h-7 mt-2 text-[9px] font-black uppercase text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Parent Portal Tab ──────────────────────────── */}
        <TabsContent value="parents" className="mt-6">
          <Card className="glass-card border-none overflow-hidden h-[600px] flex items-center justify-center text-center p-12">
            <div>
              <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <HeartHandshake className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Parent-Teacher Connect</h3>
              <p className="text-white/40 max-w-md mx-auto mb-8">
                Direct secure messaging channels between faculty and verified guardians. Coming in AXORA v2.5.
              </p>
              <Button className="rounded-xl h-11 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                Join Waitlist
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Campus Newsfeed Tab ────────────────────────── */}
        <TabsContent value="newsfeed" className="mt-6">
          <Card className="glass-card border-none overflow-hidden h-[600px] flex items-center justify-center text-center p-12">
            <div>
              <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Activity className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Campus Social Feed</h3>
              <p className="text-white/40 max-w-md mx-auto mb-8">
                An internal, moderated social wall for campus events, club activities, and student achievements.
              </p>
              <Button className="rounded-xl h-11 px-8 font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                Enable Newsfeed Module
              </Button>
            </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

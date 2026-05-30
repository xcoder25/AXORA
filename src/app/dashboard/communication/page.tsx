"use client"

import { useState } from "react"
import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, MessageSquare, Send, Bell, Mail, Smartphone, Sparkles, Filter } from "lucide-react"
import { isStaffRole } from '@/lib/roles';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';
import { formatRelativeTime } from '@/lib/format-time';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function CommunicationPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('All Students');
  const [channel, setChannel] = useState<'push' | 'email' | 'sms'>('push');

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

    startAxoraLoading('Dispatching campus broadcast…');
    try {
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        content: content.trim(),
        schoolId: profile.schoolId,
        sender: profile.displayName || user.email?.split('@')[0] || 'Administration',
        senderUid: user.uid,
        targetRole,
        channel,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white tracking-tight">Communication Hub</h2>
          <p className="text-muted-foreground text-sm md:text-lg">Manage automated alerts and campus-wide engagement.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="glass-card border-none overflow-hidden shadow-2xl">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">AI Content Assistant</span>
              </div>
              <CardTitle className="font-headline text-xl text-white">New Broadcast</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">Draft notifications to your school community.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {!isAdminOrTeacher && (
                <p className="text-xs text-muted-foreground rounded-xl bg-white/5 p-3 border border-white/10">
                  View-only mode. Contact an administrator to publish notices.
                </p>
              )}
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Subject Line</Label>
                <Input
                  placeholder="E.g. Weekend Sports Postponement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isAdminOrTeacher}
                  className="bg-white/5 border-white/10 rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Audience</Label>
                <Select value={targetRole} onValueChange={setTargetRole} disabled={!isAdminOrTeacher}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Students">All Students</SelectItem>
                    <SelectItem value="Teachers & Students">Teachers & Students</SelectItem>
                    <SelectItem value="All Roles">All Roles</SelectItem>
                    <SelectItem value="Parents">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Channel</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={channel === 'push' ? 'default' : 'outline'}
                    onClick={() => setChannel('push')}
                    disabled={!isAdminOrTeacher}
                    className="h-16 flex-col gap-1.5 rounded-xl border-white/10"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="text-[9px] font-semibold">Push</span>
                  </Button>
                  <Button
                    type="button"
                    variant={channel === 'email' ? 'default' : 'outline'}
                    onClick={() => setChannel('email')}
                    disabled={!isAdminOrTeacher}
                    className="h-16 flex-col gap-1.5 rounded-xl border-white/10"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-[9px] font-semibold">Email</span>
                  </Button>
                  <Button
                    type="button"
                    variant={channel === 'sms' ? 'default' : 'outline'}
                    onClick={() => setChannel('sms')}
                    disabled={!isAdminOrTeacher}
                    className="h-16 flex-col gap-1.5 rounded-xl border-white/10"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span className="text-[9px] font-semibold">SMS</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Message Body</Label>
                <Textarea
                  placeholder="Type your message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!isAdminOrTeacher}
                  className="min-h-[120px] bg-white/5 border-white/10 rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-white/5 p-6">
              <Button
                type="button"
                onClick={handleDispatch}
                disabled={!isAdminOrTeacher || !title.trim() || !content.trim()}
                className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 group"
              >
                <Send className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                DISPATCH MESSAGE
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <Tabs defaultValue="announcements" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card p-1 rounded-2xl h-12 border-white/5">
              <TabsTrigger value="announcements" className="rounded-xl font-bold uppercase tracking-widest text-[9px] data-[state=active]:bg-primary">
                Announcements
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl font-bold uppercase tracking-widest text-[9px] data-[state=active]:bg-primary">
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="announcements" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Broadcast History</h3>
                <Button variant="ghost" size="sm" className="text-primary font-bold uppercase tracking-widest text-[9px]">
                  <Filter className="mr-2 h-3 w-3" /> Filter
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {listLoading && (
                  <p className="col-span-full text-center text-sm text-muted-foreground py-12 animate-pulse">
                    Loading broadcasts…
                  </p>
                )}
                {!listLoading && (!announcements || announcements.length === 0) && (
                  <p className="col-span-full text-center text-sm text-muted-foreground py-12">
                    No announcements yet. Dispatch your first broadcast.
                  </p>
                )}
                {announcements?.map((ann: Record<string, unknown>) => {
                  const createdAt =
                    (ann.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
                    (ann.createdAt as string);
                  return (
                  <Card key={ann.id as string} className="glass-card border-none hover:border-primary/30 hover:bg-white/10 transition-all group overflow-hidden h-fit">
                    <CardHeader className="pb-2 p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-primary/20 text-primary">
                          {(ann.targetRole as string) || 'All'}
                        </Badge>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase">
                          {formatRelativeTime(createdAt)}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                        {ann.title as string}
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-muted-foreground line-clamp-2">
                        {ann.content as string}
                      </CardDescription>
                      <CardDescription className="text-[10px] font-medium text-muted-foreground mt-1">
                        Sent by {ann.sender as string}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 border-t border-white/5 bg-white/5 p-4">
                      <Badge variant="outline" className="text-[8px] uppercase border-white/10">
                        {(ann.channel as string) || 'push'}
                      </Badge>
                    </CardFooter>
                  </Card>
                );})}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card className="glass-card border-none">
                <CardContent className="pt-12 flex flex-col items-center justify-center py-24 opacity-50">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">No recent activity detected</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

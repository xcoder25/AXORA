
"use client"

import { useState } from "react"
import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Megaphone, MessageSquare, Send, Bell, Mail, Smartphone, Users, Sparkles, Filter } from "lucide-react"

export default function CommunicationPage() {
  const [loading, setLoading] = useState(false)
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);

  const announcements = [
    { id: 1, title: 'Term 3 Final Exams Schedule', date: '2 hours ago', sender: 'Academic Office', role: 'All Students' },
    { id: 2, title: 'Annual Science Fair Registration', date: '1 day ago', sender: 'Science Dept', role: 'Teachers & Students' },
    { id: 3, title: 'New Campus Security Protocols', date: '3 days ago', sender: 'Administration', role: 'All Roles' },
  ];

  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-black text-white tracking-tighter">Communication Hub</h2>
          <p className="text-muted-foreground text-lg">Broadcast announcements, manage automated SMS/Email alerts, and engage with the campus.</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-none overflow-hidden shadow-2xl">
            <CardHeader className="bg-primary/10 border-b border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Content Assistant</span>
              </div>
              <CardTitle className="font-headline text-2xl text-white">New Broadcast</CardTitle>
              <CardDescription className="text-muted-foreground">Draft and send notifications to your school community.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Subject Line</Label>
                <Input placeholder="E.g. Weekend Sports Postponement" className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Channel</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl border-white/10 hover:bg-primary/20 hover:border-primary transition-all group">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">App Push</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl border-white/10 hover:bg-accent/20 hover:border-accent transition-all group">
                    <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">Email</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl border-white/10 hover:bg-blue-500/20 hover:border-blue-500 transition-all group">
                    <Smartphone className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">SMS</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Message Body</Label>
                <Textarea placeholder="Type your message here..." className="min-h-[150px] bg-white/5 border-white/10 rounded-xl" />
              </div>
            </CardContent>
            <CardFooter className="bg-white/5 p-6">
              <Button className="w-full h-12 rounded-xl font-black text-lg shadow-lg shadow-primary/20 group">
                <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                DISPATCH MESSAGE
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <Tabs defaultValue="announcements" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card p-1 rounded-2xl h-14 border-white/5">
              <TabsTrigger value="announcements" className="rounded-xl font-bold uppercase tracking-widest text-xs data-[state=active]:bg-primary">
                Announcements
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl font-bold uppercase tracking-widest text-xs data-[state=active]:bg-primary">
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="announcements" className="mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white">Broadcast History</h3>
                <Button variant="ghost" size="sm" className="text-primary font-black uppercase tracking-widest text-[10px]">
                  <Filter className="mr-2 h-3 w-3" /> Filter Feed
                </Button>
              </div>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <Card key={ann.id} className="glass-card border-none hover:border-primary/30 hover:bg-white/10 transition-all group overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">
                          {ann.role}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{ann.date}</span>
                      </div>
                      <CardTitle className="text-lg font-black text-white group-hover:text-primary transition-colors">
                        {ann.title}
                      </CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">
                        Sent by {ann.sender}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 border-t border-white/5 bg-white/5 mt-4">
                      <Button variant="ghost" className="w-full h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white">
                        View Details <Megaphone className="ml-2 h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-8">
              <Card className="glass-card border-none">
                <CardContent className="pt-8 flex flex-col items-center justify-center py-20 opacity-50">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="font-black uppercase tracking-widest text-sm text-muted-foreground">No recent chat activity</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

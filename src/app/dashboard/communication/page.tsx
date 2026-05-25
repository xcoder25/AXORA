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
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Subject Line</Label>
                <Input placeholder="E.g. Weekend Sports Postponement" className="bg-white/5 border-white/10 rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Channel</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="h-16 flex-col gap-1.5 rounded-xl border-white/10 hover:bg-primary/20 hover:border-primary transition-all group">
                    <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-semibold">Push</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-1.5 rounded-xl border-white/10 hover:bg-accent/20 hover:border-accent transition-all group">
                    <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-semibold">Email</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-1.5 rounded-xl border-white/10 hover:bg-blue-500/20 hover:border-blue-500 transition-all group">
                    <Smartphone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-semibold">SMS</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Message Body</Label>
                <Textarea placeholder="Type your message here..." className="min-h-[120px] bg-white/5 border-white/10 rounded-xl" />
              </div>
            </CardContent>
            <CardFooter className="bg-white/5 p-6">
              <Button className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 group">
                <Send className="mr-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                {announcements.map((ann) => (
                  <Card key={ann.id} className="glass-card border-none hover:border-primary/30 hover:bg-white/10 transition-all group overflow-hidden h-fit">
                    <CardHeader className="pb-2 p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-primary/20 text-primary">
                          {ann.role}
                        </Badge>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase">{ann.date}</span>
                      </div>
                      <CardTitle className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                        {ann.title}
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-muted-foreground">
                        Sent by {ann.sender}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 border-t border-white/5 bg-white/5 p-4">
                      <Button variant="ghost" className="w-full h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
                        View Details <Megaphone className="ml-2 h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
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

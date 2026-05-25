
"use client"

import { useState } from "react"
import { useUser, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, BookOpen, Clock, Users, ArrowRight, Sparkles, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CBTExamsPage() {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Mock data for initial UI render
  const exams = [
    { id: 'EXM-101', title: 'Quantum Mechanics Midterm', subject: 'Physics', duration: 60, status: 'Active', students: 24 },
    { id: 'EXM-202', title: 'Intro to Algorithms', subject: 'Computer Science', duration: 90, status: 'Published', students: 42 },
    { id: 'EXM-303', title: 'Organic Chemistry Final', subject: 'Science', duration: 120, status: 'Draft', students: 0 },
  ]

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Published': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Closed': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-white/5 text-muted-foreground border-white/10'
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[9px] font-bold">
              Institutional Assessment Node
            </Badge>
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">CBT Engine</h2>
          <p className="text-muted-foreground text-lg">Computer-Based Testing hub with AI-proctoring and neural grading.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search assessments..." 
              className="bg-white/5 border-white/10 pl-9 rounded-xl h-10 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="rounded-xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-[10px]">
            <Plus className="mr-2 h-4 w-4" /> New Examination
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="glass-card border-none hover:border-primary/30 transition-all duration-500 group overflow-hidden">
            <CardHeader className="bg-white/3 border-b border-white/5 p-6 relative">
              <div className="flex justify-between items-start mb-4">
                 <Badge variant="outline" className="text-[8px] font-bold border-white/10 text-muted-foreground uppercase">
                    {exam.subject}
                 </Badge>
                 <Badge className={cn("text-[8px] font-bold uppercase", getStatusColor(exam.status))}>
                   {exam.status}
                 </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                {exam.title}
              </CardTitle>
              <CardDescription className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                ID: {exam.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-semibold">{exam.duration} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-[11px] font-semibold">{exam.students} Enrolled</span>
                  </div>
               </div>
               {exam.status === 'Active' && (
                 <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-bold text-emerald-500 uppercase">Live Session Underway</span>
                 </div>
               )}
            </CardContent>
            <CardFooter className="bg-white/3 p-4 border-t border-white/5 flex gap-2">
               <Button variant="ghost" className="flex-1 h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
                 Edit Setup
               </Button>
               <Button className="flex-1 h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest group">
                 Launch Portal <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
               </Button>
            </CardFooter>
          </Card>
        ))}

        <Card className="glass-card border-dashed border-2 border-white/5 flex flex-col items-center justify-center p-12 hover:bg-white/5 transition-all cursor-pointer">
           <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
             <Sparkles className="h-6 w-6" />
           </div>
           <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Question Architect</h3>
           <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-[200px]">
             Generate full assessments from your course syllabus in seconds.
           </p>
        </Card>
      </div>

      {/* Global Analytics Preview */}
      <div className="grid gap-8 lg:grid-cols-12">
         <Card className="lg:col-span-8 glass-card border-none overflow-hidden shadow-2xl">
            <CardHeader className="bg-white/3 border-b border-white/5 p-6">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Inference Ledger</span>
              </div>
              <CardTitle className="text-xl text-white">Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-white/5">
                 {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="flex items-center justify-between p-5 hover:bg-white/3 transition-colors group">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                            <Users className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">Scholar_Node_{i * 42}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Physics Q3 • Score: {90 - i}%</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Integrity Check</p>
                            <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-500 uppercase">Passed</Badge>
                         </div>
                         <Button variant="ghost" size="icon" className="rounded-lg hover:text-primary">
                            <ArrowRight className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                 ))}
               </div>
            </CardContent>
         </Card>

         <Card className="lg:col-span-4 glass-card border-none shadow-2xl">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
               <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Neural Proctoring</span>
               </div>
               <CardTitle className="text-xl text-white">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                     <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" /> Potential Violation
                     </p>
                     <p className="text-[11px] text-white/80 leading-relaxed italic">
                        "Secondary device reflection detected in Student_12 monitor plane."
                     </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/3 border border-white/5 opacity-50">
                     <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Status: Nominal</p>
                     <p className="text-[10px] text-muted-foreground">All remaining nodes reporting high integrity.</p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}

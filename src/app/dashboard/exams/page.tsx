"use client"

import { useState } from "react"
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, BookOpen, Clock, Users, ArrowRight, Sparkles, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function CBTExamsPage() {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const db = useFirestore()
  
  const examsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'exams'), where('schoolId', '==', 'INST-001'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: exams } = useCollection(examsQuery);

  const filteredExams = exams?.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateExam = () => {
    const examId = `EXM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const docRef = doc(db, 'exams', examId);
    const payload = {
      title: 'New Assessment',
      subject: 'Undetermined',
      duration: 60,
      status: 'Draft',
      schoolId: 'INST-001',
      createdAt: new Date().toISOString(),
      students: 0
    };

    setDoc(docRef, payload, { merge: true })
      .catch(async () => {
        const err = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: payload });
        errorEmitter.emit('permission-error', err);
      });
  };

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
          <Button className="rounded-xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-[10px]" onClick={handleCreateExam}>
            <Plus className="mr-2 h-4 w-4" /> New Examination
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams?.map((exam) => (
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
                NODE: {exam.id}
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
                    <span className="text-[11px] font-semibold">{exam.students || 0} Enrolled</span>
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

        <Card className="glass-card border-dashed border-2 border-white/5 flex flex-col items-center justify-center p-12 hover:bg-white/5 transition-all cursor-pointer" onClick={handleCreateExam}>
           <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
             <Sparkles className="h-6 w-6" />
           </div>
           <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Question Architect</h3>
           <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-[200px]">
             Generate full assessments from your course syllabus in seconds.
           </p>
        </Card>
      </div>
    </div>
  )
}
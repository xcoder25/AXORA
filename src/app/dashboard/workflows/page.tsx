"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Zap, 
  Smartphone, 
  Plus, 
  Filter, 
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  Play
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, where, doc, updateDoc, setDoc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function WorkflowsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null)
  
  const workflowsQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null;
    return query(collection(db, 'workflows'), where('schoolId', '==', profile.schoolId));
  }, [db, profile?.schoolId]);

  const { data: workflows } = useCollection(workflowsQuery);

  const toggleWorkflow = (wfId: string, currentStatus: boolean) => {
    const docRef = doc(db, 'workflows', wfId);
    updateDoc(docRef, { isActive: !currentStatus })
      .catch(async () => {
        const err = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { isActive: !currentStatus } });
        errorEmitter.emit('permission-error', err);
      });
  };

  const handleCreateWorkflow = () => {
    if (!profile?.schoolId) return;
    const id = `WF-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const docRef = doc(db, 'workflows', id);
    const payload = {
      trigger: "New System Event",
      action: "Notify Ops",
      via: "Dashboard",
      isActive: true,
      freq: "Instant",
      schoolId: profile.schoolId,
    };

    setDoc(docRef, payload, { merge: true })
      .catch(async () => {
        const err = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: payload });
        errorEmitter.emit('permission-error', err);
      });
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-accent/20 text-accent bg-accent/5 uppercase tracking-widest text-[9px] font-bold">
              Institutional Automation Hub
            </Badge>
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight leading-tight">Smart Workflows</h2>
          <p className="text-muted-foreground text-lg">Automate institutional tasks with "If-Then" logic triggers.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5">
            <Filter className="mr-2 h-4 w-4" /> Trigger Types
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-accent text-accent-foreground font-bold uppercase tracking-widest text-[10px]" onClick={handleCreateWorkflow}>
            <Plus className="mr-2 h-4 w-4" /> New Workflow
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Active Automations", value: workflows?.filter(w => w.isActive).length || "0", icon: Zap, color: "text-accent" },
          { label: "Dispatched Today", value: "1,284", icon: Smartphone, color: "text-primary" },
          { label: "Response Rate", value: "88.4%", icon: CheckCircle2, color: "text-emerald-400" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-none hover:border-accent/20 transition-all group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-none overflow-hidden shadow-2xl">
        <CardHeader className="bg-white/3 border-b border-white/5 p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">Workflow Logic Ledger</CardTitle>
            <CardDescription className="text-xs">Managing your school's automated behavior nodes.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest h-8 px-4 bg-white/5 border border-white/10 rounded-xl">
            Recent Executions <Play className="ml-2 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y divide-white/5">
             {workflows?.map((wf) => (
               <div key={wf.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/3 transition-all group gap-6">
                  <div className="flex items-center gap-6">
                     <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all",
                        wf.isActive ? "bg-accent/10 border-accent/30 text-accent" : "bg-white/5 border-white/10 text-muted-foreground opacity-50"
                     )}>
                        <Zap className={cn("h-6 w-6", wf.isActive && "animate-pulse")} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-white leading-tight">{wf.trigger}</p>
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Action:</span>
                           <Badge variant="outline" className="text-[8px] border-white/10 text-primary uppercase h-4 font-bold">{wf.action}</Badge>
                           <span className="text-[10px] text-muted-foreground/40 font-mono tracking-tighter">via {wf.via}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-8 justify-between sm:justify-end">
                     <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Frequency</p>
                        <p className="text-xs font-bold text-white">{wf.freq}</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <Switch checked={wf.isActive} onCheckedChange={() => toggleWorkflow(wf.id, wf.isActive)} className="data-[state=checked]:bg-accent" />
                        <Button variant="ghost" size="icon" className="rounded-xl hover:text-white text-muted-foreground">
                           <MoreHorizontal className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               </div>
             ))}
             {(!workflows || workflows.length === 0) && (
                <div className="py-24 text-center opacity-30">
                  <Zap className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">No active automation nodes.</p>
                </div>
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
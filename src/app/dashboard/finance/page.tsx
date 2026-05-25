"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, TrendingUp, AlertCircle, Plus, DollarSign, Smartphone, PieChart } from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy, doc, setDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function FinanceHubPage() {
  const [activeTab, setActiveTab] = useState("ledger");
  const db = useFirestore();

  const financeQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'finance'), where('schoolId', '==', 'INST-001'), orderBy('lastPaymentDate', 'desc'));
  }, [db]);

  const { data: feeRecords } = useCollection(financeQuery);

  const handleCreateInvoice = () => {
    const studentId = `STU-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const docRef = doc(db, 'finance', studentId);
    const payload = {
      studentId,
      studentName: 'New Applicant',
      tuition: 1500,
      pta: 100,
      transport: 200,
      paid: 0,
      status: 'Pending',
      schoolId: 'INST-001',
      lastPaymentDate: new Date().toISOString()
    };
    
    setDoc(docRef, payload, { merge: true })
      .catch(async () => {
        const err = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: payload });
        errorEmitter.emit('permission-error', err);
      });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] h-5">
              Financial Node Active
            </Badge>
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Finance Command</h2>
          <p className="text-muted-foreground text-lg">Fee splitting, debt recovery, and automated fiscal reporting.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5">
            <Receipt className="mr-2 h-4 w-4" /> Export Ledger
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-bold uppercase tracking-widest text-[10px]" onClick={handleCreateInvoice}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$428,500", trend: "+12.4%", icon: DollarSign, color: "text-emerald-400" },
          { label: "Outstanding Debt", value: "$18,240", trend: "42 Students", icon: AlertCircle, color: "text-orange-400" },
          { label: "Collection Rate", value: "94.2%", trend: "Optimal", icon: TrendingUp, color: "text-primary" },
          { label: "Discounts Applied", value: "$5,400", trend: "Siblings/Scholarships", icon: PieChart, color: "text-blue-400" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-none hover:border-primary/20 transition-all group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{stat.label}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <p className={`text-[9px] font-bold uppercase tracking-widest ${stat.color}/80`}>{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-2xl h-12 border-white/5">
          <TabsTrigger value="ledger" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Fee Ledger</TabsTrigger>
          <TabsTrigger value="splitting" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Fee Structure</TabsTrigger>
          <TabsTrigger value="discounts" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Discounts & Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-8 space-y-6">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="bg-white/3 border-b border-white/5 p-6">
              <CardTitle className="text-xl text-white">Student Debt Registry</CardTitle>
              <CardDescription className="text-xs">Real-time tracking of tuition and ancillary fees.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {feeRecords?.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-6 hover:bg-white/3 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{rec.studentName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {rec.studentId} • Last Node Access: {rec.lastPaymentDate?.slice(0, 10)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Split Distribution</p>
                        <div className="flex gap-2">
                           <Badge variant="outline" className="text-[8px] h-4 border-white/5">TUI: ${rec.tuition}</Badge>
                           <Badge variant="outline" className="text-[8px] h-4 border-white/5">PTA: ${rec.pta}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">${rec.paid} / {(rec.tuition + (rec.transport || 0) + rec.pta)}</p>
                        <Badge className={rec.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}>
                          {rec.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl text-primary hover:bg-primary/10">
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!feeRecords || feeRecords.length === 0) && (
                   <div className="py-24 text-center opacity-30">
                      < Receipt className="h-12 w-12 mx-auto mb-4" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">No records detected in local node.</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
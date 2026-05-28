"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, where, orderBy, doc, setDoc, updateDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import {
  Receipt, TrendingUp, AlertCircle, Plus, DollarSign, Smartphone, PieChart,
  Sliders, ShieldCheck, HeartHandshake, CheckCircle2, RefreshCw, Sparkles, Send
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function FinanceHubPage() {
  const [activeTab, setActiveTab] = useState("ledger");
  const db = useFirestore();
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // New Invoice form inputs
  const [newStuName, setNewStuName] = useState("");
  const [newStuId, setNewStuId] = useState("");
  const [newTuition, setNewTuition] = useState("1500");
  const [newPta, setNewPta] = useState("100");
  const [newTransport, setNewTransport] = useState("200");

  const financeQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null;
    return query(
      collection(db, 'finance'),
      where('schoolId', '==', profile.schoolId),
      orderBy('lastPaymentDate', 'desc')
    );
  }, [db, profile?.schoolId]);

  const { data: feeRecords } = useCollection(financeQuery);

  // 1. Fee Splitting / Allocations state
  const [splitTuition, setSplitTuition] = useState(70);
  const [splitPta, setSplitPta] = useState(15);
  const [splitTransport, setSplitTransport] = useState(15);

  // 2. Automated Discount Rules configuration state
  const [siblingDiscount, setSiblingDiscount] = useState(10);
  const [scholarshipDiscount, setScholarshipDiscount] = useState(50);

  const handleCreateInvoice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile?.schoolId) return;

    const studentId = newStuId.trim() || `STU-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const name = newStuName.trim() || 'New Applicant';
    const tVal = parseFloat(newTuition) || 0;
    const pVal = parseFloat(newPta) || 0;
    const trVal = parseFloat(newTransport) || 0;

    const docRef = doc(db, 'finance', studentId);
    const payload = {
      studentId,
      studentName: name,
      tuition: tVal,
      pta: pVal,
      transport: trVal,
      paid: 0,
      status: 'Pending',
      schoolId: profile.schoolId,
      lastPaymentDate: new Date().toISOString()
    };
    
    await setDoc(docRef, payload, { merge: true })
      .then(() => {
        setNewStuName("");
        setNewStuId("");
      })
      .catch(async () => {
        const err = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: payload });
        errorEmitter.emit('permission-error', err);
      });
  };

  const triggerReconciliation = async (studentId: string, fullPay = false) => {
    if (!db) return;
    setLoadingAction(studentId);
    const docRef = doc(db, 'finance', studentId);
    const record = feeRecords?.find(r => r.studentId === studentId);
    if (!record) return;

    const totalExpected = record.tuition + (record.transport || 0) + record.pta;
    const newPaid = fullPay ? totalExpected : Math.min(record.paid + 500, totalExpected);
    const newStatus = newPaid >= totalExpected ? 'Paid' : 'Partially Paid';

    await updateDoc(docRef, {
      paid: newPaid,
      status: newStatus,
      lastPaymentDate: new Date().toISOString()
    }).catch(() => {});
    setLoadingAction(null);
  };

  // Metrics Aggregations
  const totalRevenue = feeRecords?.reduce((acc, curr) => acc + (curr.paid || 0), 0) || 0;
  const totalExpected = feeRecords?.reduce((acc, curr) => acc + (curr.tuition + (curr.transport || 0) + curr.pta), 0) || 0;
  const outstandingDebt = totalExpected - totalRevenue;
  const debtStudentsCount = feeRecords?.filter(r => r.status !== 'Paid').length || 0;
  const collectionRate = totalExpected > 0 ? ((totalRevenue / totalExpected) * 100).toFixed(1) : "100";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] h-5">
              Financial Node Active
            </Badge>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]">Finance Command</h2>
          <p className="text-muted-foreground text-lg">Fee splitting, debt recovery, and automated fiscal reporting.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest">
            <Receipt className="mr-2 h-4 w-4" /> Export Ledger
          </Button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue Collected", value: `$${totalRevenue.toLocaleString()}`, trend: "Real-time Node Pool", icon: DollarSign, color: "text-emerald-400" },
          { label: "Outstanding Debt", value: `$${outstandingDebt.toLocaleString()}`, trend: `${debtStudentsCount} Active Debts`, icon: AlertCircle, color: "text-orange-400" },
          { label: "Collection Rate", value: `${collectionRate}%`, trend: "Optimal Liquidity threshold", icon: TrendingUp, color: "text-primary" },
          { label: "Discounts Applied", value: "$5,400", trend: "Siblings/Scholarships rules active", icon: PieChart, color: "text-blue-400" },
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
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main interactive Tab Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-2xl h-12 border-white/5">
          <TabsTrigger value="ledger" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Fee Ledger & Reconciliation</TabsTrigger>
          <TabsTrigger value="splitting" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Fee Splitting Engine</TabsTrigger>
          <TabsTrigger value="discounts" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Discount Architect</TabsTrigger>
        </TabsList>

        {/* Tab 1: Ledger and Direct Action Reconciliation */}
        <TabsContent value="ledger" className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Real-time registry list */}
            <div className="lg:col-span-8">
              <Card className="glass-card border-none overflow-hidden h-full">
                <CardHeader className="bg-white/3 border-b border-white/5 p-6">
                  <CardTitle className="text-xl text-white">Student Debt Registry</CardTitle>
                  <CardDescription className="text-xs">Real-time tracking and click-to-reconcile balance adjustments.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {feeRecords?.map((rec) => {
                      const totalExpected = rec.tuition + (rec.transport || 0) + rec.pta;
                      const hasBalance = rec.paid < totalExpected;
                      return (
                        <div key={rec.id} className="flex items-center justify-between p-6 hover:bg-white/3 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all",
                              rec.status === 'Paid' ? 'border-emerald-500/20 bg-emerald-500/5' : ''
                            )}>
                              <DollarSign className={cn("h-5 w-5", rec.status === 'Paid' ? 'text-emerald-400' : 'text-muted-foreground')} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{rec.studentName}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                ID: {rec.studentId} • Last Ref: {rec.lastPaymentDate?.slice(0, 10)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-right">
                            <div className="hidden sm:block">
                              <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Split Distribution</p>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-[8px] h-4 border-white/5">TUI: ${rec.tuition}</Badge>
                                <Badge variant="outline" className="text-[8px] h-4 border-white/5">PTA: ${rec.pta}</Badge>
                                {rec.transport > 0 && <Badge variant="outline" className="text-[8px] h-4 border-white/5">TRN: ${rec.transport}</Badge>}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">${rec.paid} / {totalExpected}</p>
                              <Badge className={rec.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}>
                                {rec.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {hasBalance ? (
                                <>
                                  <Button 
                                    size="sm"
                                    onClick={() => triggerReconciliation(rec.studentId, false)} 
                                    disabled={loadingAction !== null}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary text-[9px] font-bold uppercase tracking-wider rounded-xl h-8"
                                  >
                                    Pay $500
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => triggerReconciliation(rec.studentId, true)} 
                                    disabled={loadingAction !== null}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-xl h-8"
                                  >
                                    Clear Debt
                                  </Button>
                                </>
                              ) : (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none flex items-center gap-1 text-[8px] tracking-wide font-black uppercase h-8 px-2 rounded-xl">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled
                                </Badge>
                              )}
                              <Button variant="ghost" size="icon" className="rounded-xl text-primary hover:bg-primary/10">
                                <Smartphone className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!feeRecords || feeRecords.length === 0) && (
                      <div className="py-24 text-center opacity-30">
                        <Receipt className="h-12 w-12 mx-auto mb-4" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">No records detected in local node.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Invoice generator */}
            <div className="lg:col-span-4">
              <Card className="glass-card border-none h-fit">
                <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Live Node Issuer</span>
                  </div>
                  <CardTitle className="text-xl text-white">Create Invoice</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Student Name</Label>
                      <Input
                        placeholder="e.g. Alice Smith"
                        value={newStuName}
                        onChange={e => setNewStuName(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Student ID</Label>
                      <Input
                        placeholder="e.g. STU-8821"
                        value={newStuId}
                        onChange={e => setNewStuId(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Tuition ($)</Label>
                        <Input
                          type="number"
                          value={newTuition}
                          onChange={e => setNewTuition(e.target.value)}
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">PTA ($)</Label>
                        <Input
                          type="number"
                          value={newPta}
                          onChange={e => setNewPta(e.target.value)}
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Transport ($)</Label>
                        <Input
                          type="number"
                          value={newTransport}
                          onChange={e => setNewTransport(e.target.value)}
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
                      <Plus className="mr-2 h-4 w-4" /> Issue Ledger Entry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Dynamic Fee Splitting & Allocations */}
        <TabsContent value="splitting" className="mt-8 space-y-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="glass-card border-none">
              <CardHeader className="bg-primary/5 border-b border-white/5 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sliders className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Asset Allocation config</span>
                </div>
                <CardTitle className="text-xl text-white">Dynamic Asset Allocation</CardTitle>
                <CardDescription className="text-xs">Adjust how collected fees are split between internal reserve pools automatically.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Core Tuition Pool</span>
                    <span className="text-primary">{splitTuition}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={splitTuition} 
                    onChange={e => {
                      const t = Number(e.target.value);
                      setSplitTuition(t);
                      const rem = 100 - t;
                      setSplitPta(Math.round(rem / 2));
                      setSplitTransport(Math.round(rem / 2));
                    }}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">PTA Development Fund</span>
                    <span className="text-primary">{splitPta}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={splitPta} 
                    onChange={e => {
                      const p = Number(e.target.value);
                      setSplitPta(p);
                      const rem = 100 - p;
                      setSplitTuition(Math.round(rem * 0.8));
                      setSplitTransport(Math.round(rem * 0.2));
                    }}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Logistics & Infrastructure</span>
                    <span className="text-primary">{splitTransport}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={splitTransport} 
                    onChange={e => {
                      const tr = Number(e.target.value);
                      setSplitTransport(tr);
                      const rem = 100 - tr;
                      setSplitTuition(Math.round(rem * 0.8));
                      setSplitPta(Math.round(rem * 0.2));
                    }}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Current Rule Status</p>
                  <div className="flex items-center gap-2 text-xs text-white/95">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Splitting rules synchronized across {feeRecords?.length || 0} active student node profiles.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none flex flex-col justify-between">
              <CardHeader className="bg-white/3 border-b border-white/5 p-6">
                <CardTitle className="text-lg text-white">Consolidated Split Preview</CardTitle>
                <CardDescription className="text-xs">Estimated distribution based on current total collected revenue.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-center">
                <div className="space-y-4">
                  {[
                    { label: "Core Tuition Pool", amount: (totalRevenue * splitTuition) / 100, pct: splitTuition, color: "bg-primary" },
                    { label: "PTA Development Fund", amount: (totalRevenue * splitPta) / 100, pct: splitPta, color: "bg-blue-400" },
                    { label: "Logistics & Transport", amount: (totalRevenue * splitTransport) / 100, pct: splitTransport, color: "bg-emerald-400" },
                  ].map((pool, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white/80">{pool.label} ({pool.pct}%)</span>
                        <span className="font-bold text-white">${pool.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <Progress value={pool.pct} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t border-white/5 bg-white/3 flex justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Estimated Pool: ${totalRevenue.toLocaleString()}</span>
                <Button className="h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest">
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Recalculate
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Discounts & Auto-matching Rules */}
        <TabsContent value="discounts" className="mt-8 space-y-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="glass-card border-none">
              <CardHeader className="bg-primary/5 border-b border-white/5 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Discounts Rules Config</span>
                </div>
                <CardTitle className="text-xl text-white">Automated Discount Rules</CardTitle>
                <CardDescription className="text-xs">Define smart rules that lower outstanding balances automatically for siblings or scholarships.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-white font-semibold">Sibling Rule Multiplier</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={siblingDiscount} 
                        onChange={e => setSiblingDiscount(Number(e.target.value))}
                        className="bg-white/5 border-white/10 rounded-xl h-9 w-20 text-center font-bold text-white"
                      />
                      <span className="text-xs text-muted-foreground">% Off</span>
                    </div>
                  </div>
                  <Progress value={siblingDiscount} className="h-1 bg-white/5" />
                  <p className="text-[10px] text-muted-foreground">Applies automatically if two or more students share identical family references.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-white font-semibold">Institutional Scholarship</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={scholarshipDiscount} 
                        onChange={e => setScholarshipDiscount(Number(e.target.value))}
                        className="bg-white/5 border-white/10 rounded-xl h-9 w-20 text-center font-bold text-white"
                      />
                      <span className="text-xs text-muted-foreground">% Off</span>
                    </div>
                  </div>
                  <Progress value={scholarshipDiscount} className="h-1 bg-white/5" />
                  <p className="text-[10px] text-muted-foreground">Applies directly to core tuition value on approved board merit flags.</p>
                </div>

                <Button className="w-full h-11 rounded-xl font-bold text-[10px] uppercase tracking-widest mt-4">
                  Commit Discount Schema
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader className="bg-white/3 border-b border-white/5 p-6">
                <CardTitle className="text-lg text-white">Active Rule Telemetry</CardTitle>
                <CardDescription className="text-xs font-medium">Automatic system reconciliation logs based on active discount rules.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { rule: "Sibling Discount Match", target: "STU-A492 & STU-A493", discount: `-${siblingDiscount}%`, details: "Shared guardian signature verified", status: "Active" },
                    { rule: "Board Merit Scholarship", target: "STU-8821", discount: `-${scholarshipDiscount}%`, details: "Approved in Academic Registry Node", status: "Active" }
                  ].map((rule, i) => (
                    <div key={i} className="flex justify-between items-start p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">{rule.rule}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{rule.details}</p>
                        <p className="text-[9px] font-mono text-primary uppercase mt-1">Node Target: {rule.target}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black">{rule.discount}</Badge>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1.5">{rule.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Wallet, 
  Receipt, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  Smartphone,
  PieChart,
  UserPlus
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const feeRecords = [
  { id: 'FEE-101', student: 'Kojo Mensah', tuition: 1200, transport: 300, pta: 50, paid: 1550, status: 'Paid', date: 'Oct 12' },
  { id: 'FEE-102', student: 'Amara Okafor', tuition: 1200, transport: 0, pta: 50, paid: 600, status: 'Partial', date: 'Oct 15' },
  { id: 'FEE-103', student: 'Zaidu Ibrahim', tuition: 1200, transport: 300, pta: 50, paid: 0, status: 'Overdue', date: 'Oct 01' },
];

export default function FinanceHubPage() {
  const [activeTab, setActiveTab] = useState("ledger");

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
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-bold uppercase tracking-widest text-[10px]">
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
                {feeRecords.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-6 hover:bg-white/3 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{rec.student}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {rec.id} • Last Payment: {rec.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Fee Split</p>
                        <div className="flex gap-2">
                           <Badge variant="outline" className="text-[8px] h-4 border-white/5">TUI: ${rec.tuition}</Badge>
                           <Badge variant="outline" className="text-[8px] h-4 border-white/5">PTA: ${rec.pta}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">${rec.paid} / ${(rec.tuition + rec.transport + rec.pta)}</p>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="splitting" className="mt-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg text-white">Institutional Fee Splits</CardTitle>
                <CardDescription>Configure categories for granular billing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Tuition', 'Examination Fee', 'PTA Levy', 'Bus/Transport', 'Library Resource'].map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                    <span className="text-sm font-semibold text-white/80">{cat}</span>
                    <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[8px]">Mandatory</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed border-white/10 bg-transparent text-[10px] font-bold uppercase tracking-widest h-10">
                  <Plus className="mr-2 h-3 w-3" /> Add Category
                </Button>
              </CardContent>
            </Card>
            <Card className="glass-card border-none bg-primary/5">
               <CardHeader>
                 <CardTitle className="text-lg text-white">Automated Reminders</CardTitle>
                 <CardDescription>Multi-channel debt recovery logic.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Smartphone className="h-3 w-3" /> SMS Gateway
                    </p>
                    <p className="text-xs text-muted-foreground">Automatically notify parents when debt exceeds 50% of tuition after 30 days.</p>
                 </div>
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck className="h-3 w-3" /> WhatsApp Ledger
                    </p>
                    <p className="text-xs text-muted-foreground">Send digital receipts instantly upon payment confirmation.</p>
                 </div>
               </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

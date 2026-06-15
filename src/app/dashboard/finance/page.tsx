'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Download, Filter, Search, Receipt, CreditCard, Landmark, PieChart,
  CheckCircle2, Clock, AlertTriangle, Building2, Smartphone, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ───────────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { id: 'TRX-9982', student: 'Alice Johnson', type: 'Tuition Fee', amount: '$1,200', date: 'Today, 10:42 AM', status: 'completed', method: 'Card' },
  { id: 'TRX-9981', student: 'Brian Okafor', type: 'Bus Fare', amount: '$150', date: 'Today, 09:15 AM', status: 'completed', method: 'Bank Transfer' },
  { id: 'TRX-9980', student: 'Chioma Nweke', type: 'Tuition Fee', amount: '$1,200', date: 'Yesterday', status: 'pending', method: 'Payment Link' },
  { id: 'TRX-9979', student: 'David Eze', type: 'Library Fine', amount: '$25', date: 'Yesterday', status: 'failed', method: 'Card' },
  { id: 'TRX-9978', student: 'Emeka Adeyemi', type: 'PTA Levy', amount: '$50', date: 'Oct 12', status: 'completed', method: 'Cash' },
];

const OUTSTANDING = [
  { id: 'INV-442', student: 'Chioma Nweke', grade: 'SSS-3A', amount: '$1,200', due: '3 days ago', risk: 'low' },
  { id: 'INV-418', student: 'David Eze', grade: 'JSS-2B', amount: '$2,450', due: '45 days ago', risk: 'high' },
  { id: 'INV-390', student: 'Sarah Jones', grade: 'SSS-1A', amount: '$850', due: '12 days ago', risk: 'medium' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinanceHubPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase tracking-widest text-[9px]">
            <Landmark className="mr-1 h-3 w-3" /> Financial Command
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            Finance & Ledgers
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Institutional revenue tracking, fee collection, automated reconciliation, and debt recovery.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-5 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <Button className="rounded-xl h-11 px-5 font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20">
            <Receipt className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (Term)', value: '$1.42M', icon: DollarSign, trend: '+12%', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Collection Rate', value: '94.2%', icon: PieChart, trend: '+2.1%', color: 'text-primary bg-primary/10 border-primary/20' },
          { label: 'Outstanding Dues', value: '$84.5K', icon: AlertTriangle, trend: '-5%', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Transactions Today', value: '128', icon: TrendingUp, trend: '+14', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <div className={cn('flex items-center text-[10px] font-bold mb-1',
                    stat.trend.startsWith('+') && stat.label !== 'Outstanding Dues' ? 'text-emerald-400' :
                    stat.trend.startsWith('-') && stat.label === 'Outstanding Dues' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Tabs ────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card border-white/5 p-1.5 rounded-2xl h-auto gap-1">
          {[
            { value: 'overview', label: 'Financial Overview', icon: PieChart },
            { value: 'transactions', label: 'Transactions', icon: Receipt },
            { value: 'debtors', label: 'Debt Recovery', icon: AlertTriangle },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}
              className="rounded-xl font-black uppercase tracking-widest text-[8px] px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* Recent Transactions List */}
            <Card className="glass-card border-white/5 lg:col-span-8">
              <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-emerald-400" /> Recent Transactions
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-[9px] font-bold uppercase text-white/50 hover:text-white">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {TRANSACTIONS.map(trx => {
                    const isSuccess = trx.status === 'completed';
                    const isPending = trx.status === 'pending';
                    const Icon = isSuccess ? CheckCircle2 : isPending ? Clock : AlertTriangle;
                    const color = isSuccess ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                  isPending ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                  'text-red-400 bg-red-500/10 border-red-500/20';
                    return (
                      <div key={trx.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.03]">
                        <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center shrink-0', color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{trx.student}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
                            <span>{trx.id}</span>
                            <span>•</span>
                            <span>{trx.type}</span>
                            <span>•</span>
                            <span>{trx.method}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">{trx.amount}</p>
                          <p className="text-[9px] text-white/30 mt-0.5">{trx.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Debt Snapshot */}
            <div className="lg:col-span-4 space-y-6">
              
              <Card className="glass-card-premium border-emerald-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent pointer-events-none" />
                <CardHeader className="border-b border-white/5 pb-4 relative z-10">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-400 group-hover:rotate-12 transition-transform" /> Payment Link Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 relative z-10">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Amount</Label>
                    <Input placeholder="0.00" type="number" className="bg-black/40 border-white/10 rounded-xl h-12 text-2xl font-black text-emerald-400 placeholder:text-emerald-400/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Purpose</Label>
                    <Input placeholder="e.g. Excursion Fee" className="bg-white/5 border-white/10 rounded-xl h-10" />
                  </div>
                  <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 mt-2">
                    Generate Paystack Link
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> High-Risk Debtors
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {OUTSTANDING.slice(0,2).map(debt => (
                      <div key={debt.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold text-white">{debt.student}</p>
                            <p className="text-[10px] text-white/40">{debt.grade} • {debt.id}</p>
                          </div>
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[8px] font-black">{debt.due}</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-black text-red-400">{debt.amount}</p>
                          <Button size="sm" className="h-7 rounded-lg text-[8px] font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white">
                            <Send className="mr-1.5 h-3 w-3" /> Remind
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full h-10 text-[9px] font-bold uppercase tracking-widest text-white/50 hover:text-white border-t border-white/5 rounded-none rounded-b-xl">
                    View All Debtors
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client"

import { useUser, useDoc, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, CreditCard, Receipt, TrendingUp, AlertCircle, Plus, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function FinancePage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);

  const isAdmin = profile?.role === 'admin';

  // Mock data for charts
  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const recentInvoices = [
    { id: 'INV-001', student: 'Alex Johnson', fee: 'Tuition Q3', amount: 1200, status: 'paid', date: '2023-10-01' },
    { id: 'INV-002', student: 'Sarah Williams', fee: 'Lab Fees', amount: 350, status: 'outstanding', date: '2023-10-05' },
    { id: 'INV-003', student: 'Michael Chen', fee: 'Sports Membership', amount: 150, status: 'paid', date: '2023-10-10' },
    { id: 'INV-004', student: 'Elena Rodriguez', fee: 'Library Fine', amount: 25, status: 'overdue', date: '2023-09-20' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-black text-white tracking-tighter">Fees & Finance</h2>
          <p className="text-muted-foreground text-lg">Manage institutional revenue, student invoices, and payment tracking.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Receipt className="mr-2 h-4 w-4" />
              Fee Structure
            </Button>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Generate Invoices
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">$324,500</div>
            <p className="text-[10px] font-bold text-accent uppercase flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +12.4% vs last term
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Outstanding Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">$12,840</div>
            <p className="text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> 42 Pending Invoices
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">96%</div>
            <Progress value={96} className="h-1.5 mt-2 bg-white/5" />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400">EXCELLENT</div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">AI Verified Stability</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 glass-card border-none">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-white">Revenue Analysis</CardTitle>
            <CardDescription className="text-muted-foreground">Monthly fee collections across all categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#02040a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 glass-card border-none">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-muted-foreground">Latest invoice updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{inv.student}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{inv.fee}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">${inv.amount}</p>
                    <Badge variant="outline" className={`text-[9px] uppercase tracking-tighter ${inv.status === 'paid' ? 'border-emerald-500/20 text-emerald-500' : 'border-orange-500/20 text-orange-500'}`}>
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10">
              View All Invoices <Receipt className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

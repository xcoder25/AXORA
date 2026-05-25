"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, CreditCard, Receipt, TrendingUp, AlertCircle, Plus, DollarSign, Download, Clock } from "lucide-react"

export default function PayrollPage() {
  const staffPayroll = [
    { id: 'STAFF-001', name: 'Dr. Sarah Smith', role: 'Head of Physics', base: 4500, bonus: 200, status: 'disbursed', date: '2023-10-28' },
    { id: 'STAFF-002', name: 'Prof. Mark Johnson', role: 'Senior Lecturer', base: 4200, bonus: 150, status: 'pending', date: '2023-11-01' },
    { id: 'STAFF-003', name: 'Elena Rodriguez', role: 'Admin Coordinator', base: 3200, bonus: 0, status: 'disbursed', date: '2023-10-28' },
    { id: 'STAFF-004', name: 'James Wilson', role: 'Security Head', base: 2800, bonus: 100, status: 'disbursed', date: '2023-10-28' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">HR & Payroll</h2>
          <p className="text-muted-foreground text-lg">Manage institutional staff accounts, benefits, and salary disbursement.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Run Payroll Cycle
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">$142,500</div>
            <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +2.1% from Q3
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Disbursement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">$12,420</div>
            <p className="text-[9px] text-orange-400 font-bold uppercase mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> 8 Accounts Awaiting
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tax Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">100%</div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">AI Audit Verified</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Staff Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">124</div>
            <p className="text-[9px] text-primary font-bold uppercase mt-1">Full-time Faculty</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-xl text-white">Faculty Salary Ledger</CardTitle>
          <CardDescription>Cycle: October 2023 - Professional & Support Staff</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Member</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Role</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Base Salary</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Adjustments</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffPayroll.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">{item.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.role}</TableCell>
                  <TableCell className="text-xs text-white/90">${item.base.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] ${item.bonus > 0 ? 'border-emerald-500/20 text-emerald-500' : 'border-white/10 text-muted-foreground'}`}>
                      {item.bonus > 0 ? `+$${item.bonus}` : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={item.status === 'disbursed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500 animate-pulse'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-white">${(item.base + item.bonus).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

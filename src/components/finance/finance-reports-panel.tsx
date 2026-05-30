'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { FeeRecord, FinanceExpense, FinanceSnapshot } from '@/lib/finance-types';
import {
  buildMonthlyRevenueChart,
  exportLedgerCsv,
  downloadCsv,
  formatMoney,
  feeTotal,
} from '@/lib/finance-metrics';
import { Download, FileSpreadsheet, TrendingUp, Wallet } from 'lucide-react';

export function FinanceReportsPanel({
  feeRecords,
  expenses,
  snapshot,
  currency = 'USD',
}: {
  feeRecords: FeeRecord[];
  expenses: FinanceExpense[];
  snapshot: FinanceSnapshot;
  currency?: string;
}) {
  const monthly = buildMonthlyRevenueChart(feeRecords);

  const feeBreakdown = [
    { name: 'Tuition', value: feeRecords.reduce((a, r) => a + r.tuition, 0) },
    { name: 'PTA', value: feeRecords.reduce((a, r) => a + r.pta, 0) },
    { name: 'Transport', value: feeRecords.reduce((a, r) => a + (r.transport || 0), 0) },
  ];

  const expenseByCategory = expenses
    .filter((e) => e.status === 'posted')
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const expenseChart = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Financial Reports & Analytics</h3>
          <p className="text-xs text-muted-foreground">Revenue trends, fee composition, and P&amp;L snapshot</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10"
            onClick={() =>
              downloadCsv(`axora-ledger-${new Date().toISOString().slice(0, 10)}.csv`, exportLedgerCsv(feeRecords, currency))
            }
          >
            <Download className="mr-2 h-3.5 w-3.5" /> Ledger CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Gross Collections', value: snapshot.totalRevenue, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Operating Expenses', value: snapshot.expenseTotal, icon: Wallet, color: 'text-orange-400' },
          { label: 'Net Position', value: snapshot.netPosition, icon: FileSpreadsheet, color: 'text-primary' },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card border-none">
            <CardHeader className="pb-1">
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest">{stat.label}</CardDescription>
              <CardTitle className={`text-2xl font-bold ${stat.color}`}>{formatMoney(stat.value, currency)}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-base text-white">Monthly Collections ({new Date().getFullYear()})</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8 }} />
                <Area type="monotone" dataKey="collected" stroke="#10b981" fill="#10b98133" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-base text-white">Fee Revenue Composition</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {expenseChart.length > 0 && (
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-base text-white">Expense by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#888" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#888" fontSize={10} width={100} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="value" fill="#f97316" name="Amount" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-base text-white">Trial Balance Summary</CardTitle>
          <CardDescription>Simplified accountant view — debits vs credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Credits (Collections)</p>
              <p className="text-xl font-bold text-emerald-400">{formatMoney(snapshot.totalRevenue, currency)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Debits (Expenses)</p>
              <p className="text-xl font-bold text-orange-400">{formatMoney(snapshot.expenseTotal, currency)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Accounts Receivable (Outstanding)</p>
              <p className="text-xl font-bold text-yellow-400">{formatMoney(snapshot.outstandingDebt, currency)}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Expected billing: {formatMoney(snapshot.totalExpected, currency)} across {feeRecords.length} student accounts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

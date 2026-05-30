'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { FeeRecord, FinanceSnapshot } from '@/lib/finance-types';
import { feeBalance, formatMoney } from '@/lib/finance-metrics';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FinanceAgingPanel({
  feeRecords,
  snapshot,
  currency = 'USD',
}: {
  feeRecords: FeeRecord[];
  snapshot: FinanceSnapshot;
  currency?: string;
}) {
  const buckets = [
    { label: '0–30 days', key: 'current' as const, color: 'text-emerald-400', bar: 'bg-emerald-500' },
    { label: '31–60 days', key: 'days30' as const, color: 'text-yellow-400', bar: 'bg-yellow-500' },
    { label: '61–90 days', key: 'days60' as const, color: 'text-orange-400', bar: 'bg-orange-500' },
    { label: '90+ days', key: 'days90' as const, color: 'text-red-400', bar: 'bg-red-500' },
  ];

  const overdueAccounts = feeRecords
    .filter((r) => feeBalance(r) > 0)
    .sort((a, b) => feeBalance(b) - feeBalance(a));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Accounts Receivable Aging</h3>
        <p className="text-xs text-muted-foreground">Outstanding balances grouped by days since last payment</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {buckets.map((b) => {
          const amount = snapshot.aging[b.key];
          const pct = snapshot.outstandingDebt > 0 ? (amount / snapshot.outstandingDebt) * 100 : 0;
          return (
            <Card key={b.key} className="glass-card border-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[9px] font-bold uppercase tracking-widest">{b.label}</CardDescription>
                <CardTitle className={cn('text-2xl', b.color)}>{formatMoney(amount, currency)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={pct} className="h-1.5" />
                <p className="mt-2 text-[9px] text-muted-foreground">{pct.toFixed(0)}% of total AR</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card border-none">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Clock className="h-4 w-4 text-orange-400" /> Delinquent Accounts
          </CardTitle>
          <CardDescription>Sorted by outstanding balance — prioritize collections</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {overdueAccounts.slice(0, 15).map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-4 hover:bg-white/3">
                <div>
                  <p className="text-sm font-bold text-white">{rec.studentName}</p>
                  <p className="text-[10px] text-muted-foreground">ID: {rec.studentId} · {rec.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-400">{formatMoney(feeBalance(rec), currency)}</p>
                  <p className="text-[9px] text-muted-foreground">Last pay: {rec.lastPaymentDate?.slice(0, 10) || 'Never'}</p>
                </div>
              </div>
            ))}
            {overdueAccounts.length === 0 && (
              <div className="flex flex-col items-center py-12 text-emerald-400">
                <AlertTriangle className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-[10px] font-bold uppercase">All accounts current</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FinanceTransaction } from '@/lib/finance-types';
import { exportTransactionsCsv, downloadCsv, formatMoney } from '@/lib/finance-metrics';
import { CreditCard, Download, RefreshCw } from 'lucide-react';

export function FinanceTransactionsPanel({
  transactions,
  currency = 'USD',
}: {
  transactions: FinanceTransaction[];
  currency?: string;
}) {
  const handleExport = () => {
    downloadCsv(`axora-transactions-${new Date().toISOString().slice(0, 10)}.csv`, exportTransactionsCsv(transactions));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Payment Transaction Log</h3>
          <p className="text-xs text-muted-foreground">Paystack and manual reconciliation entries</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-white/10" onClick={handleExport}>
          <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/3 p-5">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <CreditCard className="h-4 w-4 text-emerald-400" /> {transactions.length} Transactions
          </CardTitle>
          <CardDescription>Immutable audit trail — newest first</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id || tx.reference} className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-white/3">
                <div>
                  <p className="text-sm font-bold text-white">{tx.studentName}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{tx.reference}</p>
                  <p className="text-[9px] uppercase text-muted-foreground/70">{tx.paidAt?.slice(0, 19).replace('T', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{formatMoney(tx.amount, currency)}</p>
                  <Badge
                    className={
                      tx.status === 'success'
                        ? 'border-none bg-emerald-500/10 text-[8px] text-emerald-400'
                        : 'border-none bg-orange-500/10 text-[8px] text-orange-400'
                    }
                  >
                    {tx.channel} · {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <RefreshCw className="mx-auto mb-3 h-8 w-8 opacity-30" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No transactions recorded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

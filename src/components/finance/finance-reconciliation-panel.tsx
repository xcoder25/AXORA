'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { FinanceSnapshot, FinanceTransaction } from '@/lib/finance-types';
import { formatMoney } from '@/lib/finance-metrics';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';
import { Building2, CheckCircle2, Scale } from 'lucide-react';

export function FinanceReconciliationPanel({
  snapshot,
  transactions,
  currency = 'USD',
}: {
  snapshot: FinanceSnapshot;
  transactions: FinanceTransaction[];
  currency?: string;
}) {
  const [bankBalance, setBankBalance] = useState('');
  const [reconciled, setReconciled] = useState(false);

  const bookBalance = useMemo(() => {
    const paystackTotal = transactions
      .filter((t) => t.status === 'success' && t.channel === 'paystack')
      .reduce((a, t) => a + t.amount, 0);
    return paystackTotal;
  }, [transactions]);

  const bank = parseFloat(bankBalance) || 0;
  const variance = bank - bookBalance;
  const matched = Math.abs(variance) < 0.01;

  const handleReconcile = () => {
    startAxoraLoading('Running bank reconciliation…');
    setTimeout(() => {
      setReconciled(true);
      stopAxoraLoading();
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Bank Reconciliation</h3>
        <p className="text-xs text-muted-foreground">Match Paystack settlements against your bank statement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Book Balance (Paystack)', value: bookBalance, sub: `${transactions.filter((t) => t.channel === 'paystack').length} settlements` },
          { label: 'Bank Statement Balance', value: bank, sub: 'Enter from your bank' },
          { label: 'Variance', value: variance, sub: matched ? 'Balanced' : 'Needs review', warn: !matched && bank > 0 },
        ].map((item) => (
          <Card key={item.label} className="glass-card border-none">
            <CardHeader className="pb-1">
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest">{item.label}</CardDescription>
              <CardTitle className={`text-2xl font-bold ${item.warn ? 'text-orange-400' : item.label === 'Variance' && matched ? 'text-emerald-400' : 'text-white'}`}>
                {formatMoney(Math.abs(item.value), currency)}
                {item.label === 'Variance' && variance !== 0 && (variance > 0 ? ' +' : ' −')}
              </CardTitle>
              <p className="text-[9px] text-muted-foreground">{item.sub}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-none">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Building2 className="h-4 w-4 text-primary" /> Reconciliation Worksheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase text-muted-foreground">Bank Statement Ending Balance</Label>
              <Input
                type="number"
                value={bankBalance}
                onChange={(e) => { setBankBalance(e.target.value); setReconciled(false); }}
                placeholder="Enter amount from bank"
                className="rounded-xl border-white/10 bg-white/5 h-11"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Outstanding AR (not in bank)</p>
              <p className="text-xl font-bold text-yellow-400">{formatMoney(snapshot.outstandingDebt, currency)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Expected but not yet collected via Paystack</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total collections (ledger)</span><span className="font-bold text-white">{formatMoney(snapshot.totalRevenue, currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paystack channel volume</span><span className="font-bold text-emerald-400">{formatMoney(bookBalance, currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Operating expenses</span><span className="font-bold text-orange-400">−{formatMoney(snapshot.expenseTotal, currency)}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-2"><span className="font-bold text-white">Net position</span><span className="font-bold text-primary">{formatMoney(snapshot.netPosition, currency)}</span></div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleReconcile} className="rounded-xl font-bold" disabled={!bankBalance}>
              <Scale className="mr-2 h-4 w-4" /> Run Reconciliation
            </Button>
            {reconciled && (
              <Badge className="border-none bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {matched ? 'Books balanced — no variance' : `Variance flagged: ${formatMoney(Math.abs(variance), currency)}`}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

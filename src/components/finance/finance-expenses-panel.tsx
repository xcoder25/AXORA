'use client';

import { useState, useEffect } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import type { FinanceExpense } from '@/lib/finance-types';
import { formatMoney } from '@/lib/finance-metrics';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';
import { Plus, Receipt, Trash2 } from 'lucide-react';

const CATEGORIES = ['Salaries', 'Utilities', 'Supplies', 'Maintenance', 'Transport', 'Technology', 'General'];

export function FinanceExpensesPanel({
  expenses,
  schoolId,
  userId,
  currency = 'USD',
  prefill,
  onPrefillConsumed,
}: {
  expenses: FinanceExpense[];
  schoolId: string;
  userId: string;
  currency?: string;
  prefill?: { category?: string; amount?: number; description?: string; vendor?: string };
  onPrefillConsumed?: () => void;
}) {
  const db = useFirestore();
  const [category, setCategory] = useState(prefill?.category || 'General');
  const [amount, setAmount] = useState(String(prefill?.amount || ''));
  const [description, setDescription] = useState(prefill?.description || '');
  const [vendor, setVendor] = useState(prefill?.vendor || '');

  useEffect(() => {
    if (!prefill) return;
    if (prefill.category) setCategory(prefill.category);
    if (prefill.amount) setAmount(String(prefill.amount));
    if (prefill.description) setDescription(prefill.description);
    if (prefill.vendor) setVendor(prefill.vendor);
    onPrefillConsumed?.();
  }, [prefill, onPrefillConsumed]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !schoolId || !amount) return;
    startAxoraLoading('Posting expense…');
    const id = `EXP-${Date.now()}`;
    const payload: Omit<FinanceExpense, 'id'> & { id?: string } = {
      schoolId,
      category,
      amount: parseFloat(amount) || 0,
      description: description.trim() || `${category} expense`,
      vendor: vendor.trim() || undefined,
      date: new Date().toISOString(),
      createdBy: userId,
      status: 'posted',
    };
    try {
      await setDoc(doc(db, 'finance_expenses', id), payload);
      setAmount('');
      setDescription('');
      setVendor('');
    } finally {
      stopAxoraLoading();
    }
  };

  const totalPosted = expenses.filter((e) => e.status === 'posted').reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Expense Journal</h3>
        <p className="text-xs text-muted-foreground">Record operating expenses for accurate net position reporting</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="glass-card border-none lg:col-span-4">
          <CardHeader className="border-b border-white/5 bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Plus className="h-4 w-4 text-primary" /> Post Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handlePost} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground">Amount ({currency})</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl border-white/10 bg-white/5" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground">Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl border-white/10 bg-white/5" placeholder="e.g. March electricity bill" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground">Vendor (optional)</Label>
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} className="rounded-xl border-white/10 bg-white/5" />
              </div>
              <Button type="submit" className="w-full rounded-xl font-bold">Post to Ledger</Button>
            </form>
          </CardContent>
          <CardFooter className="border-t border-white/5 p-4 text-[10px] text-muted-foreground">
            Total posted: <span className="ml-1 font-bold text-orange-400">{formatMoney(totalPosted, currency)}</span>
          </CardFooter>
        </Card>

        <Card className="glass-card border-none lg:col-span-8">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Receipt className="h-4 w-4 text-orange-400" /> Expense Register
            </CardTitle>
            <CardDescription>{expenses.length} entries</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-4 hover:bg-white/3">
                  <div>
                    <p className="text-sm font-bold text-white">{exp.description}</p>
                    <p className="text-[10px] text-muted-foreground">{exp.category} · {exp.vendor || 'No vendor'} · {exp.date?.slice(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-400">{formatMoney(exp.amount, currency)}</p>
                    <Badge className="border-none bg-emerald-500/10 text-[8px] text-emerald-400">{exp.status}</Badge>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <Trash2 className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p className="text-[10px] font-bold uppercase">No expenses posted</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

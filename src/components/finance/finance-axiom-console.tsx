'use client';

import { useState, useCallback } from 'react';
import { processVoiceCommand, type VoiceCommandOutput } from '@/ai/flows/axora-voice-command';
import { parseFinanceActionFromAi, dispatchFinanceAction } from '@/lib/axiom-finance-actions';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';
import type { FinanceSnapshot } from '@/lib/finance-types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Bot } from 'lucide-react';
import { formatMoney } from '@/lib/finance-metrics';

type Msg = { id: string; role: 'user' | 'assistant'; content: string; navigateTo?: string; actionLabel?: string };

const QUICK_PROMPTS = [
  'Show outstanding debt summary',
  'Export the fee ledger to CSV',
  'Who are the top 5 debtors?',
  'Open aging report',
  'Record a $500 utilities expense',
  'Send reminders to overdue accounts',
];

export function FinanceAxiomConsole({
  schoolName,
  snapshot,
  compact = false,
}: {
  schoolName?: string;
  snapshot: FinanceSnapshot;
  compact?: boolean;
}) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'intro',
      role: 'assistant',
      content: `I'm connected to your live ledger. Collection rate is ${snapshot.collectionRate.toFixed(1)}% with ${formatMoney(snapshot.outstandingDebt)} outstanding. Ask me to export reports, record expenses, chase debtors, or navigate any finance module.`,
    },
  ]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
      setInput('');
      setLoading(true);
      startAxoraLoading('AXIOM is analyzing finances…');

      try {
        const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
        const result: VoiceCommandOutput = await processVoiceCommand({
          command: text,
          conversationHistory: history,
          schoolContext: {
            schoolName,
            revenueCollectionRate: Math.round(snapshot.collectionRate),
            pendingInvoices: snapshot.debtStudentsCount,
            financeSnapshot: {
              totalRevenue: snapshot.totalRevenue,
              totalExpected: snapshot.totalExpected,
              outstandingDebt: snapshot.outstandingDebt,
              netPosition: snapshot.netPosition,
              expenseTotal: snapshot.expenseTotal,
              transactionVolume: snapshot.transactionVolume,
              paidStudents: snapshot.paidStudentsCount,
              partialStudents: snapshot.partialCount,
              pendingStudents: snapshot.pendingCount,
              aging: snapshot.aging,
              topDebtors: snapshot.topDebtors,
            },
          },
        });

        const financeAction = parseFinanceActionFromAi(result.data);
        if (financeAction) dispatchFinanceAction(financeAction);

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: result.response,
            navigateTo: result.navigateTo,
            actionLabel: financeAction ? `Execute: ${financeAction.type.replace(/_/g, ' ')}` : undefined,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: 'err', role: 'assistant', content: 'Could not process that request. Try rephrasing or check your connection.' },
        ]);
      } finally {
        setLoading(false);
        stopAxoraLoading();
      }
    },
    [loading, messages, schoolName, snapshot]
  );

  return (
    <CardShell compact={compact}>
      <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-primary">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AXIOM Finance Desk</p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-400/80">Accountant AI · Live Ledger</p>
          </div>
        </div>
        <Badge className="border-none bg-emerald-500/10 text-[8px] font-bold uppercase text-emerald-400">
          {snapshot.collectionRate.toFixed(0)}% collected
        </Badge>
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-1.5 border-b border-white/5 px-4 py-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => send(p)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-semibold text-white/70 transition hover:border-primary/30 hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <ScrollArea className={compact ? 'h-40' : 'h-52'}>
        <div className="space-y-2.5 p-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[90%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-primary text-white'
                    : 'rounded-bl-sm border border-white/10 bg-white/5 text-white/90'
                )}
              >
                {msg.content}
                {msg.actionLabel && (
                  <p className="mt-1.5 flex items-center gap-1 text-[9px] font-bold uppercase text-emerald-400">
                    <Sparkles className="h-2.5 w-2.5" /> {msg.actionLabel}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin text-primary" /> Processing…
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 border-t border-white/5 p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask AXIOM: export ledger, record expense, chase debtors…"
          className="h-9 flex-1 rounded-xl border-white/10 bg-white/5 text-xs"
          disabled={loading}
        />
        <Button size="sm" className="h-9 rounded-xl px-3" onClick={() => send(input)} disabled={loading || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </CardShell>
  );
}

function CardShell({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a14]/80 shadow-2xl backdrop-blur-xl',
        compact ? '' : 'lg:col-span-12'
      )}
    >
      {children}
    </div>
  );
}

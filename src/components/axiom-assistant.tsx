'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc } from '@/firebase';
import { processVoiceCommand, type VoiceCommandOutput } from '@/ai/flows/axora-voice-command';
import { isAdminRole } from '@/lib/roles';
import { useFinanceData } from '@/hooks/use-finance-data';
import { parseFinanceActionFromAi, dispatchFinanceAction } from '@/lib/axiom-finance-actions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic, MicOff, Send, X, Sparkles, Zap, AlertTriangle, CreditCard, ChevronRight
} from 'lucide-react';

// ── Trial gate helpers ────────────────────────────────────────────────────────
const TRIAL_KEY = 'axiom-trial-start';
const TRIAL_DAYS = 3;

function getTrialStatus(): { active: boolean; daysLeft: number; expired: boolean; subscribed: boolean } {
  if (typeof window === 'undefined') return { active: false, daysLeft: 0, expired: false, subscribed: false };
  const subscribed = localStorage.getItem('axiom-subscribed') === 'true';
  if (subscribed) return { active: true, daysLeft: 999, expired: false, subscribed: true };

  const raw = localStorage.getItem(TRIAL_KEY);
  if (!raw) {
    // First use — start trial now
    localStorage.setItem(TRIAL_KEY, Date.now().toString());
    return { active: true, daysLeft: TRIAL_DAYS, expired: false, subscribed: false };
  }
  const start = parseInt(raw, 10);
  const elapsed = (Date.now() - start) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
  const expired = elapsed >= TRIAL_DAYS;
  return { active: !expired, daysLeft, expired, subscribed: false };
}

// ── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: string;
  navigateTo?: string;
  citations?: string[];
};

// ── Web Speech API typing ────────────────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function AxiomAssistant() {
  const router = useRouter();
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const { data: school } = useDoc(profile?.schoolId ? `schools/${profile.schoolId}` : null);
  const { snapshot } = useFinanceData(open ? (profile?.schoolId as string | undefined) : undefined);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [trial, setTrial] = useState(() => getTrialStatus());
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refresh trial on open
  useEffect(() => {
    if (open) setTrial(getTrialStatus());
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when open
  useEffect(() => {
    if (open && !trial.expired) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, trial.expired]);

  // Greet on first open
  useEffect(() => {
    if (open && messages.length === 0 && trial.active) {
      const name = profile?.displayName?.split(' ')[0] || 'Admin';
      setMessages([{
        id: 'greet',
        role: 'assistant',
        content: `Hello ${name}! I'm AXIOM — your institutional intelligence assistant. ${
          !trial.subscribed
            ? `You have **${trial.daysLeft} day${trial.daysLeft !== 1 ? 's' : ''}** left on your free trial.`
            : ''
        } Try: "Show outstanding debt", "Export the ledger", or "Record a $500 expense".`,
      }]);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading || trial.expired) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const result: VoiceCommandOutput = await processVoiceCommand({
        command: text,
        conversationHistory: history,
        schoolContext: {
          schoolName: (school?.name as string) || profile?.schoolId || '',
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
      if (financeAction) {
        dispatchFinanceAction(financeAction);
        if (result.navigateTo?.includes('finance') || financeAction.type !== 'switch_tab') {
          router.push('/dashboard/finance');
        }
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        action: result.action,
        navigateTo: result.navigateTo,
        citations: result.citations,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, profile, school, snapshot, trial.expired, router]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSubscribe = () => {
    // In production: redirect to Paystack checkout
    localStorage.setItem('axiom-subscribed', 'true');
    setTrial(getTrialStatus());
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  // Only show for admins
  if (!isAdminRole(profile?.role)) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110',
          trial.expired && !trial.subscribed
            ? 'bg-orange-500 shadow-orange-500/30'
            : 'bg-gradient-to-br from-primary to-violet-600 shadow-primary/30',
          open && 'rotate-12'
        )}
        title="AXIOM Assistant"
      >
        <Sparkles className="h-6 w-6 text-white" />
        {trial.active && !trial.subscribed && trial.daysLeft <= 1 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-400 border-2 border-white text-[7px] font-bold text-white flex items-center justify-center">
            {trial.daysLeft}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className={cn(
          'fixed bottom-24 right-6 z-50 w-[380px] rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col',
          'bg-[#0a0a14] backdrop-blur-3xl'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-primary/20 to-violet-600/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">AXIOM</p>
                <p className="text-[8px] text-primary/80 uppercase tracking-widest font-bold mt-0.5">Institutional AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!trial.subscribed && (
                <Badge className={cn(
                  'text-[8px] font-bold uppercase border-none',
                  trial.expired
                    ? 'bg-orange-500/20 text-orange-400'
                    : trial.daysLeft <= 1
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-primary/20 text-primary'
                )}>
                  {trial.expired ? 'Trial Expired' : `${trial.daysLeft}d trial`}
                </Badge>
              )}
              {trial.subscribed && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] font-bold uppercase flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Pro
                </Badge>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Trial Expired Gate */}
          {trial.expired && !trial.subscribed ? (
            <div className="flex flex-col items-center justify-center gap-5 p-8 text-center">
              <div className="h-14 w-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Trial Ended</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Your 3-day free trial has ended. Subscribe to AXIOM Pro to continue using the AI voice assistant across all modules.
                </p>
              </div>
              <div className="w-full space-y-2">
                <Button
                  onClick={handleSubscribe}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-primary/20"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Subscribe — $9.99/mo
                </Button>
                <p className="text-[9px] text-muted-foreground/50">Billed monthly · Cancel anytime</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="h-72">
                <div className="p-4 space-y-3" ref={scrollRef}>
                  {messages.map(msg => (
                    <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
                      )}>
                        <p className="whitespace-pre-wrap text-[12px]">{msg.content}</p>
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2.5 space-y-1 text-left">
                            <span className="text-[7.5px] uppercase font-bold text-indigo-400 tracking-wider block">Retrieved Documents:</span>
                            <div className="flex flex-wrap gap-1">
                              {msg.citations.map((cite, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[8px] bg-indigo-500/10 text-indigo-300 border-none font-bold">
                                  📄 {cite}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.navigateTo && (
                          <button
                            onClick={() => handleNavigate(msg.navigateTo!)}
                            className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            Go to {msg.navigateTo.split('/').pop()} <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-white/5 bg-white/3">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                    placeholder="Ask AXIOM anything..."
                    className="flex-1 bg-white/5 border-white/10 rounded-xl h-10 text-xs placeholder:text-white/30"
                    disabled={loading}
                  />
                  <button
                    onClick={startListening}
                    disabled={loading}
                    className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center border transition-all shrink-0',
                      listening
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                    )}
                    title={listening ? 'Listening…' : 'Speak command'}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary hover:bg-primary/80 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {!trial.subscribed && (
                  <p className="text-[8px] text-muted-foreground/40 text-center mt-2 uppercase tracking-widest">
                    {trial.daysLeft} day{trial.daysLeft !== 1 ? 's' : ''} remaining on trial
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

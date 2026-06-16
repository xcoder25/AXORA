'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, ShieldAlert, DollarSign, Camera, ClipboardList, Sparkles, CheckCircle2, Info, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useDoc } from '@/firebase';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

// Fallback demo notifications for when Firestore isn't connected
const DEMO_NOTIFICATIONS = [
  {
    id: '1', type: 'identity' as const, title: 'Neural Scan Complete',
    message: 'Camera Node 04 identified 32 students at Main Gate (94% avg confidence)',
    time: '2m ago', read: false, timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2', type: 'finance' as const, title: 'Payment Received',
    message: 'STU-8821 cleared outstanding balance of ₦150,000 via Paystack',
    time: '8m ago', read: false, timestamp: new Date(Date.now() - 480000),
  },
  {
    id: '3', type: 'security' as const, title: 'Flagged Identity Detected',
    message: 'Camera Node 09: Unknown individual detected in restricted Faculty Hub zone',
    time: '15m ago', read: false, timestamp: new Date(Date.now() - 900000),
  },
  {
    id: '4', type: 'exam' as const, title: 'Exam Session Started',
    message: 'Mathematics Mid-Term (JSS 3) is now live — 45 students active',
    time: '22m ago', read: true, timestamp: new Date(Date.now() - 1320000),
  },
  {
    id: '5', type: 'ai' as const, title: 'AXIOM Analysis Ready',
    message: 'Monthly revenue trend analysis complete — 3 recommendations generated',
    time: '1h ago', read: true, timestamp: new Date(Date.now() - 3600000),
  },
];

const ICON_MAP = {
  security: ShieldAlert,
  finance: DollarSign,
  identity: Camera,
  exam: ClipboardList,
  ai: Sparkles,
  info: Info,
};

const COLOR_MAP = {
  security: 'text-red-400 bg-red-500/10 border-red-500/20',
  finance: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  identity: 'text-primary bg-primary/10 border-primary/20',
  exam: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  ai: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  info: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const TOAST_COLOR_MAP = {
  security: 'border-red-500/30 bg-red-950/80',
  finance: 'border-emerald-500/30 bg-emerald-950/80',
  identity: 'border-primary/30 bg-indigo-950/80',
  exam: 'border-blue-500/30 bg-blue-950/80',
  ai: 'border-violet-500/30 bg-violet-950/80',
  info: 'border-slate-500/30 bg-slate-950/80',
};

// ── Toast Notification Popup ──────────────────────────────────────────────────
function NotificationToast({ notif, onDismiss }: {
  notif: { id: string; type: string; title: string; message: string };
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const type = notif.type as keyof typeof ICON_MAP;
  const Icon = ICON_MAP[type] ?? Info;
  const iconColor = COLOR_MAP[type] ?? COLOR_MAP.info;
  const toastColor = TOAST_COLOR_MAP[type] ?? TOAST_COLOR_MAP.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4700);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={cn(
      'fixed bottom-24 right-6 z-[200] w-80 rounded-2xl border backdrop-blur-3xl shadow-2xl',
      'flex items-start gap-3 p-4 transition-all duration-300',
      toastColor,
      visible
        ? 'opacity-100 translate-x-0'
        : 'opacity-0 translate-x-8'
    )}>
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-black text-white">{notif.title}</p>
          <Badge className="text-[6px] font-black border-none bg-white/10 text-white/60 uppercase tracking-wider">LIVE</Badge>
        </div>
        <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2">{notif.message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden">
        <div
          className="h-full bg-white/30"
          style={{ animation: 'shrink-width 4.7s linear forwards' }}
        />
      </div>
    </div>
  );
}

// ── Notification Center ───────────────────────────────────────────────────────
export function NotificationCenter() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const schoolId = profile?.schoolId as string | undefined;

  const [open, setOpen] = useState(false);
  const [bellShake, setBellShake] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  const {
    notifications: rtNotifs,
    unreadCount: rtUnread,
    toastNotif,
    markRead,
    markAllRead,
    dismiss,
  } = useRealtimeNotifications(schoolId);

  // Fall back to demo data if Firestore empty
  const [localDemos, setLocalDemos] = useState(DEMO_NOTIFICATIONS);
  const hasRt = rtNotifs.length > 0;
  const notifications = hasRt ? rtNotifs : localDemos;
  const unreadCount = hasRt ? rtUnread : localDemos.filter(n => !n.read).length;

  // Shake bell on new notification
  useEffect(() => {
    if (rtUnread > 0) {
      setBellShake(true);
      setTimeout(() => setBellShake(false), 600);
    }
  }, [rtUnread]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkAllRead = () => {
    if (hasRt) {
      void markAllRead();
    } else {
      setLocalDemos(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleDismiss = (id: string) => {
    if (hasRt) {
      void dismiss(id);
    } else {
      setLocalDemos(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleMarkRead = (id: string) => {
    if (hasRt) {
      void markRead(id);
    } else {
      setLocalDemos(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  return (
    <>
      {/* Toast popup for new real-time notifications */}
      {toastNotif && (
        <NotificationToast
          notif={toastNotif}
          onDismiss={() => { }}
        />
      )}

      <div className="relative" ref={trayRef}>
        {/* Bell trigger */}
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300',
            open
              ? 'border-primary/40 bg-primary/20 text-primary'
              : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10 hover:text-white',
            bellShake && 'animate-[shake_0.5s_ease-in-out]'
          )}
          title="Notifications"
        >
          <Bell className={cn('h-4 w-4 transition-transform', bellShake && 'rotate-12')} />
          {unreadCount > 0 && (
            <span className="notification-badge absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Tray */}
        {open && (
          <div className="notif-tray">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="h-4 bg-primary/20 text-primary border-none text-[8px] font-black">
                    {unreadCount} new
                  </Badge>
                )}
                {hasRt && (
                  <Badge className="h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[7px] font-black flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[9px] font-bold uppercase tracking-wider text-primary/70 hover:text-primary transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-3 opacity-50" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">All clear</p>
                  <p className="text-[9px] text-white/20 mt-1">No pending notifications</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map(notif => {
                    const type = (notif.type || 'info') as keyof typeof ICON_MAP;
                    const Icon = ICON_MAP[type] ?? Info;
                    const colors = COLOR_MAP[type] ?? COLOR_MAP.info;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkRead(notif.id)}
                        className={cn(
                          'group relative flex items-start gap-3 rounded-2xl p-3 transition-all duration-200 cursor-pointer',
                          notif.read
                            ? 'bg-white/[0.02] hover:bg-white/5'
                            : 'bg-white/[0.06] hover:bg-white/10'
                        )}
                      >
                        {!notif.read && (
                          <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs', colors)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                          <p className="text-[10px] text-white/50 leading-relaxed mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[8px] text-white/25 uppercase font-bold tracking-wider mt-1.5">{notif.time}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDismiss(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-white/30 hover:text-white/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-3">
              <Button
                variant="ghost"
                className="w-full h-8 text-[9px] font-bold uppercase tracking-widest text-primary/70 hover:bg-primary/10 hover:text-primary rounded-xl"
              >
                View All Logs
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, ShieldAlert, DollarSign, Camera, ClipboardList, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type Notification = {
  id: string;
  type: 'security' | 'finance' | 'identity' | 'exam' | 'ai' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
};

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

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1', type: 'identity', title: 'Neural Scan Complete',
    message: 'Camera Node 04 identified 32 students at Main Gate (94% avg confidence)',
    time: '2m ago', read: false
  },
  {
    id: '2', type: 'finance', title: 'Payment Received',
    message: 'STU-8821 cleared outstanding balance of $1,500 via Paystack',
    time: '8m ago', read: false
  },
  {
    id: '3', type: 'security', title: 'Flagged Identity Detected',
    message: 'Camera Node 09: Unknown individual detected in restricted Faculty Hub zone',
    time: '15m ago', read: false
  },
  {
    id: '4', type: 'exam', title: 'Exam Session Started',
    message: 'Mathematics Mid-Term (JSS 3) is now live — 45 students active',
    time: '22m ago', read: true
  },
  {
    id: '5', type: 'ai', title: 'AXIOM Analysis Ready',
    message: 'Monthly revenue trend analysis complete — 3 recommendations generated',
    time: '1h ago', read: true
  },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const trayRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={trayRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300',
          open
            ? 'border-primary/40 bg-primary/20 text-primary'
            : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10 hover:text-white'
        )}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
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
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
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
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-3 opacity-50" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">All clear</p>
                <p className="text-[9px] text-white/20 mt-1">No pending notifications</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map(notif => {
                  const Icon = ICON_MAP[notif.type];
                  const colors = COLOR_MAP[notif.type];
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
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
                        onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
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
  );
}

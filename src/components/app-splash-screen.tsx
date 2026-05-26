'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppSplashScreenProps = {
  status?: string;
  className?: string;
};

export function AppSplashScreen({
  status = 'Loading profile',
  className,
}: AppSplashScreenProps) {
  return (
    <div
      className={cn(
        'dashboard-shell fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden',
        className
      )}
    >
      <div className="dashboard-orb dashboard-orb-a" />
      <div className="dashboard-orb dashboard-orb-b" />
      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="glass-panel-light flex h-20 w-20 items-center justify-center rounded-3xl shadow-indigo-lg animate-float">
          <Sparkles className="h-9 w-9 text-indigo-600 animate-pulse" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-900">Axora OS</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-indigo-500">
            Syncing your workspace
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-xl">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

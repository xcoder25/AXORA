'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionLoaderOverlayProps = {
  active: boolean;
  message?: string;
  schoolLogo?: string | null;
  schoolName?: string;
};

export function ActionLoaderOverlay({
  active,
  message = 'Processing…',
  schoolLogo,
  schoolName,
}: ActionLoaderOverlayProps) {
  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-200"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          'glass-panel-light mx-4 flex max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/20 p-10 shadow-2xl',
          'animate-in zoom-in-95 duration-300'
        )}
      >
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-100 bg-white/90 shadow-indigo-lg">
          {schoolLogo ? (
            <img
              src={schoolLogo}
              alt=""
              className="h-full w-full rounded-2xl object-contain p-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 opacity-80" />
          )}
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="font-headline text-lg font-bold text-slate-900">{message}</p>
          {schoolName && (
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-500">
              {schoolName}
            </p>
          )}
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-indigo-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        </div>
      </div>
    </div>
  );
}

'use client';

import { Loader2, Sparkles } from 'lucide-react';

export function SchoolLoader({
  logoUrl,
  primaryColor,
  secondaryColor,
  title = 'Preparing',
  subtitle = 'Neural sync in progress',
}: {
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  title?: string;
  subtitle?: string;
}) {
  const p = primaryColor || '#6366f1';
  const s = secondaryColor || '#10b981';

  return (
    <div className="dashboard-shell fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#010206]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at center, rgba(147,51,234,0.12) 0%, transparent 65%), radial-gradient(circle at 20% 20%, rgba(16,185,129,0.10) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl border shadow-indigo-lg"
            style={{
              borderColor: `${p}55`,
              background: `linear-gradient(135deg, ${p}22 0%, ${s}15 100%)`,
            }}
          >
            {logoUrl ? (
              logoUrl.startsWith('data:') ? (
                <img
                  src={logoUrl}
                  alt="School logo"
                  className="h-full w-full rounded-[1rem] object-contain p-4"
                />
              ) : (
                <img
                  src={logoUrl}
                  alt="School logo"
                  className="h-full w-full rounded-[1rem] object-contain p-4"
                />
              )
            ) : (
              <Sparkles className="h-9 w-9 text-indigo-600 animate-pulse" />
            )}
          </div>

          <div className="text-center space-y-3">
            <h2
              className="font-headline text-3xl font-bold tracking-tight text-slate-900"
              style={{ color: p }}
            >
              {title}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 rounded-full border bg-white/5 px-6 py-3 backdrop-blur-2xl"
          style={{ borderColor: `${p}33` }}
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: p }} />
          <div className="h-2 w-2 rounded-full" style={{ background: s }} />
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Loading school workspace
          </div>
        </div>
      </div>
    </div>
  );
}


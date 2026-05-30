'use client';

import { useTheme } from '@/components/theme-provider';
import { Sun, Moon, Zap, Sunset } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEME_META = {
  dark:      { label: 'Dark',      icon: Moon,   color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
  light:     { label: 'Light',     icon: Sun,    color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  cyberpunk: { label: 'Cyberpunk', icon: Zap,    color: 'text-pink-400',   bg: 'bg-pink-500/10   border-pink-500/20'  },
  solarized: { label: 'Solarized', icon: Sunset, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
} as const;

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, cycle } = useTheme();
  const meta = THEME_META[theme];
  const Icon = meta.icon;

  if (compact) {
    return (
      <button
        onClick={cycle}
        title={`Theme: ${meta.label} — click to switch`}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105',
          meta.bg, meta.color
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {meta.label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1">
      {(Object.keys(THEME_META) as (keyof typeof THEME_META)[]).map(t => {
        const m = THEME_META[t];
        const TIcon = m.icon;
        const active = theme === t;
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            title={m.label}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all duration-300',
              active
                ? cn('border', m.bg, m.color)
                : 'text-muted-foreground hover:text-white'
            )}
          >
            <TIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

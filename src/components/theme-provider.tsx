'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────
type ThemeName = 'dark' | 'light' | 'cyberpunk' | 'solarized';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  cycle: () => void;
}

// ── Context ─────────────────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  cycle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEMES: ThemeName[] = ['dark', 'light', 'cyberpunk', 'solarized'];
const STORAGE_KEY = 'axora-theme';

const THEME_CLASSES: Record<ThemeName, string[]> = {
  dark: [],
  light: ['theme-light'],
  cyberpunk: ['theme-cyberpunk'],
  solarized: ['theme-solarized'],
};

function applyTheme(t: ThemeName) {
  const root = document.documentElement;
  // Remove all known theme classes from both <html> and <body>
  [...THEMES].forEach(name => {
    root.classList.remove(`theme-${name}`);
    document.body.classList.remove(`theme-${name}`);
  });
  // dark is the :root default — no class needed
  if (t !== 'dark') {
    root.classList.add(`theme-${t}`);
    document.body.classList.add(`theme-${t}`);
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('dark');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeName) || 'dark';
    const valid = THEMES.includes(saved) ? saved : 'dark';
    setThemeState(valid);
    applyTheme(valid);
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }, []);

  const cycle = useCallback(() => {
    setThemeState(prev => {
      const next = THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length];
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

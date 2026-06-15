'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Wallet, Camera, ShieldCheck, ClipboardList, NotebookPen,
  BookOpen, LineChart, Users, Settings, Zap, Megaphone, IdCard, Sparkles,
  Search, ArrowRight, Command, GanttChartSquare, Brain, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COMMANDS = [
  // Navigation
  { id: 'nav-dashboard', group: 'Navigate', label: 'Overview Dashboard', icon: LayoutDashboard, href: '/dashboard', shortcut: 'G D' },
  { id: 'nav-nexora', group: 'Navigate', label: 'NEXORA AI Hub', icon: Brain, href: '/dashboard/nexora', shortcut: '' },
  { id: 'nav-finance', group: 'Navigate', label: 'Finance Command', icon: Wallet, href: '/dashboard/finance', shortcut: 'G F' },
  { id: 'nav-attendance', group: 'Navigate', label: 'Identity Matrix', icon: Camera, href: '/dashboard/attendance', shortcut: 'G A' },
  { id: 'nav-security', group: 'Navigate', label: 'Security Command', icon: ShieldCheck, href: '/dashboard/security', shortcut: 'G S' },
  { id: 'nav-exams', group: 'Navigate', label: 'CBT Exam Engine', icon: ClipboardList, href: '/dashboard/exams', shortcut: 'G E' },
  { id: 'nav-grading', group: 'Navigate', label: 'AI Grading Assistant', icon: NotebookPen, href: '/dashboard/grading', shortcut: '' },
  { id: 'nav-courses', group: 'Navigate', label: 'Courses', icon: BookOpen, href: '/dashboard/courses', shortcut: '' },
  { id: 'nav-performance', group: 'Navigate', label: 'Performance Analytics', icon: LineChart, href: '/dashboard/performance', shortcut: '' },
  { id: 'nav-registry', group: 'Navigate', label: 'Student Registry', icon: Users, href: '/dashboard/registry', shortcut: '' },
  { id: 'nav-workflows', group: 'Navigate', label: 'Smart Workflows', icon: Zap, href: '/dashboard/workflows', shortcut: '' },
  { id: 'nav-communication', group: 'Navigate', label: 'Communications', icon: Megaphone, href: '/dashboard/communication', shortcut: '' },
  { id: 'nav-idcards', group: 'Navigate', label: 'ID Cards & Neural Pass', icon: IdCard, href: '/dashboard/id-cards', shortcut: '' },
  { id: 'nav-academic', group: 'Navigate', label: 'Academic Engine', icon: GanttChartSquare, href: '/dashboard/academic', shortcut: '' },
  { id: 'nav-settings', group: 'Navigate', label: 'Settings', icon: Settings, href: '/dashboard/settings', shortcut: 'G S' },
  // Quick Actions
  { id: 'action-axiom', group: 'Actions', label: 'Open AXIOM AI Assistant', icon: Sparkles, action: 'open-axiom', shortcut: '⌥ A' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  // Group results
  const groups = filtered.reduce<Record<string, typeof COMMANDS>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback((cmd: typeof COMMANDS[0]) => {
    if (cmd.href) {
      router.push(cmd.href);
    } else if (cmd.action === 'open-axiom') {
      window.dispatchEvent(new CustomEvent('open-axiom'));
    }
    setOpen(false);
    setQuery('');
  }, [router]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      if (flatFiltered[selected]) handleSelect(flatFiltered[selected]);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="command-backdrop"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="command-panel animate-in fade-in zoom-in-95 duration-200">
        {/* Search bar */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyNav}
            placeholder="Search pages, actions, commands..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          <div className="flex items-center gap-1">
            <kbd className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/50">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-2">
          {flatFiltered.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/30">
              No results for "{query}"
            </div>
          ) : (
            Object.entries(groups).map(([group, cmds]) => (
              <div key={group} className="mb-3">
                <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                  {group}
                </p>
                {cmds.map((cmd) => {
                  const globalIdx = flatFiltered.indexOf(cmd);
                  const isSelected = globalIdx === selected;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelected(globalIdx)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                        isSelected
                          ? 'bg-primary/20 text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all',
                          isSelected
                            ? 'border-primary/40 bg-primary/20 text-primary'
                            : 'border-white/10 bg-white/5 text-white/40'
                        )}>
                          <cmd.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">{cmd.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cmd.shortcut && (
                          <span className="text-[9px] font-mono text-white/25">{cmd.shortcut}</span>
                        )}
                        {isSelected && <ArrowRight className="h-3 w-3 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2.5">
          <div className="flex items-center gap-3 text-[9px] text-white/25">
            <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 py-0.5 rounded text-[8px]">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 py-0.5 rounded text-[8px]">↵</kbd> Select</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-white/25">
            <Command className="h-3 w-3" />
            <span>AXORA Command</span>
          </div>
        </div>
      </div>
    </>
  );
}

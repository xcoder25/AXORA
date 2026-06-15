'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { useUser, useDoc, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Separator } from '@/components/ui/separator';
import { LogOut, Building, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRoleLabel, isAdminRole } from '@/lib/roles';
import { AppSplashScreen } from '@/components/app-splash-screen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AxiomAssistant } from '@/components/axiom-assistant';
import { ActionLoaderOverlay } from '@/components/action-loader-overlay';
import { CommandPalette } from '@/components/command-palette';
import { NotificationCenter } from '@/components/notification-center';

function MissingProfileScreen({ user, onLogout }: { user: FirebaseUser; onLogout: () => void }) {
  return (
    <div className="dashboard-shell flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel-light max-w-md space-y-6 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <h2 className="font-headline text-xl font-bold text-slate-900">Profile not found</h2>
        <p className="text-sm text-slate-600">
          Signed in as <span className="font-medium text-indigo-700">{user.email}</span>, but no user record exists in Firestore.
          Use <strong>Deploy</strong> to create an institution admin account, or ask your school to add you.
        </p>
        <Button onClick={onLogout} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700">
          Back to login
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navProgress, setNavProgress] = useState(0);
  const [navLoading, setNavLoading] = useState(false);
  const [axoraLoading, setAxoraLoading] = useState(false);
  const [axoraMessage, setAxoraMessage] = useState<string | undefined>();

  useEffect(() => {
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      setAxoraLoading(true);
      setAxoraMessage(detail?.message);
    };
    const onStop = () => {
      setAxoraLoading(false);
      setAxoraMessage(undefined);
    };
    window.addEventListener('axora-loading-start', onStart);
    window.addEventListener('axora-loading-stop', onStop);
    return () => {
      window.removeEventListener('axora-loading-start', onStart);
      window.removeEventListener('axora-loading-stop', onStop);
    };
  }, []);

  useEffect(() => {
    if (navLoading) {
      setNavProgress(100);
      const timer = setTimeout(() => {
        setNavLoading(false);
        setNavProgress(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.target !== '_blank') {
        const url = new URL(anchor.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          setNavLoading(true);
          setNavProgress(15);
          
          const timer = setInterval(() => {
            setNavProgress(prev => {
              if (prev >= 90) {
                clearInterval(timer);
                return 90;
              }
              return prev + (100 - prev) * 0.12;
            });
          }, 180);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [pathname]);

  const { data: profile, loading: profileLoading } = useDoc(user ? `users/${user.uid}` : null);
  const { data: school, loading: schoolLoading } = useDoc(profile?.schoolId ? `schools/${profile.schoolId}` : null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const workspaceLoading =
    authLoading || (user && profileLoading) || (profile?.schoolId && schoolLoading);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (workspaceLoading) return <AppSplashScreen status="Loading profile" />;
  if (!user) return null;
  if (!profile) return <MissingProfileScreen user={user} onLogout={handleLogout} />;

  const userRole = profile.role as string;
  const roleLabel = formatRoleLabel(userRole);

  return (
    <SidebarProvider className="dashboard-shell min-h-screen">
      <ActionLoaderOverlay
        active={navLoading || axoraLoading}
        message={axoraMessage || (navLoading ? 'Loading page…' : 'Processing…')}
        schoolLogo={school?.logoUrl}
        schoolName={school?.name}
      />
      {navLoading && (
        <div 
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-pink-500 z-[9999] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(139,92,246,0.8)]"
          style={{ width: `${navProgress}%` }}
        />
      )}
      <div className="dashboard-mesh pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <DashboardSidebar
        userRole={userRole}
        schoolLogo={school?.logoUrl}
        schoolName={school?.name}
      />
      <SidebarInset className="relative flex min-h-screen flex-col bg-transparent">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border/80 bg-card/70 px-6 shadow-sm backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 duration-500">
          <SidebarTrigger className="-ml-1 text-muted-foreground transition-colors hover:text-primary" />
          <Separator orientation="vertical" className="mx-2 h-4 bg-border/60" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-transform hover:scale-105">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none text-foreground">
                  {school?.name || 'Institution'}
                </span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-primary/80">
                  {profile.schoolId}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Command Palette Trigger */}
              <button
                onClick={() => {
                  const e = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
                  window.dispatchEvent(e);
                }}
                className="hidden md:flex items-center gap-2 h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] text-muted-foreground hover:border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200"
                title="Command Palette (Ctrl+K)"
              >
                <Command className="h-3 w-3" />
                <span className="font-medium">Search...</span>
                <kbd className="ml-1 rounded bg-white/10 px-1 py-0.5 text-[8px] font-bold">Ctrl K</kbd>
              </button>
              <NotificationCenter />
              <ThemeToggle compact />
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {profile.displayName || user.email?.split('@')[0]}
                </p>
                <p
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider',
                    isAdminRole(userRole) ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {roleLabel}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
          <CommandPalette />
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both">
            {children}
          </div>
          <AxiomAssistant />
          <footer className="mt-auto flex items-center justify-between border-t border-indigo-100/80 pt-6 pb-2 text-slate-400">
            <p className="text-[9px] font-semibold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} {school?.name || 'Axora'}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">NEXORA</p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

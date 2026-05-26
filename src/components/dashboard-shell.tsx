'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { useUser, useDoc, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Separator } from '@/components/ui/separator';
import { LogOut, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRoleLabel, isAdminRole } from '@/lib/roles';
import { AppSplashScreen } from '@/components/app-splash-screen';

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
      <div className="dashboard-mesh pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <DashboardSidebar
        userRole={userRole}
        schoolLogo={school?.logoUrl}
        schoolName={school?.name}
      />
      <SidebarInset className="relative flex min-h-screen flex-col bg-transparent">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-indigo-100/80 bg-white/70 px-6 shadow-sm backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-500">
          <SidebarTrigger className="-ml-1 text-slate-500 transition-colors hover:text-indigo-600" />
          <Separator orientation="vertical" className="mx-2 h-4 bg-indigo-100" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm transition-transform hover:scale-105">
                <Building className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none text-slate-900">
                  {school?.name || 'Institution'}
                </span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-indigo-500/80">
                  {profile.schoolId}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {profile.displayName || user.email?.split('@')[0]}
                </p>
                <p
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider',
                    isAdminRole(userRole) ? 'text-indigo-600' : 'text-slate-500'
                  )}
                >
                  {roleLabel}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both">
            {children}
          </div>
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

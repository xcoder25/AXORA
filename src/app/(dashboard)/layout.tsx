
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { LogOut, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  const { data: profile, loading: profileLoading } = useDoc(user ? `users/${user.uid}` : null);
  const { data: school, loading: schoolLoading } = useDoc(profile?.schoolId ? `schools/${profile.schoolId}` : null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#010206]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Validating Session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <DashboardSidebar userRole={profile?.role || 'student'} schoolLogo={school?.logoUrl} schoolName={school?.name} />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-background/20 backdrop-blur-3xl px-6">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-white" />
          <Separator orientation="vertical" className="mx-2 h-4 opacity-10" />
          
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/5 border border-white/5">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white leading-none">
                  {school?.name || 'Loading Instance...'}
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                  Node ID: {profile?.schoolId || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white uppercase tracking-wider">{profile?.displayName || user.email?.split('@')[0]}</p>
                <div className={cn(
                  "flex items-center justify-end gap-1 text-[9px] font-semibold uppercase tracking-wider",
                  profile?.role === 'parent' ? "text-emerald-500" : "text-primary"
                )}>
                  {profile?.role || 'Scholar'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                className="hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-lg h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 md:p-10 relative">
          {children}
          
          <footer className="mt-auto pt-8 pb-4 border-t border-white/5 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
             <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
               &copy; {new Date().getFullYear()} {school?.name || 'Axora'} Institutional Node
             </p>
             <div className="flex items-center gap-2">
               <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">powered by</span>
               <span className="text-[10px] font-bold tracking-tight text-white">NEXORA</span>
             </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

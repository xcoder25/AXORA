'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogOut, ShieldCheck, Building, Heart, User, Sparkles, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && !profileLoading && (!profile?.schoolId || !schoolLoading)) {
      const timer = setTimeout(() => setBooting(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, profileLoading, schoolLoading, profile]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (booting || authLoading || (user && (profileLoading || (profile?.schoolId && schoolLoading)))) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#02040a] relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-150" />
        <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-full" />
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-2xl relative">
              {school?.logoUrl ? (
                <div className="relative w-16 h-16">
                  <Image 
                    src={school.logoUrl} 
                    alt={school.name} 
                    fill 
                    className="object-contain" 
                  />
                </div>
              ) : (
                <GraduationCap className="h-12 w-12" />
              )}
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="font-headline text-2xl font-black text-white tracking-tighter">
              {school?.name || 'ScholAI Enterprise'}
            </h2>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Instance</span>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] mt-4">
                Powered by <span className="text-white/60">NEXORA</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="h-3 w-3" />;
      case 'parent': return <Heart className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  return (
    <SidebarProvider>
      <DashboardSidebar userRole={profile?.role || 'student'} schoolLogo={school?.logoUrl} schoolName={school?.name} />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/60 backdrop-blur-2xl px-6">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-white" />
          <Separator orientation="vertical" className="mx-2 h-4 opacity-10" />
          
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                <Building className="h-4 w-4 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm font-black tracking-tight text-white leading-none">
                  {school?.name || 'Loading...'}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  Portal Node: {profile?.schoolId || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white uppercase tracking-wider">{profile?.displayName || user.email?.split('@')[0]}</p>
                <div className={cn(
                  "flex items-center justify-end gap-1 text-[10px] font-bold uppercase",
                  profile?.role === 'parent' ? "text-pink-500" : "text-accent"
                )}>
                  {getRoleIcon(profile?.role)}
                  {profile?.role || 'Scholar'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                className="hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-xl h-10 w-10 border border-transparent hover:border-red-500/20"
                title="Secure Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 md:p-10 relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px] -z-10" />
          {children}
          
          <footer className="mt-auto pt-10 pb-4 border-t border-white/5 flex items-center justify-between opacity-30 group hover:opacity-100 transition-opacity">
             <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
               &copy; {new Date().getFullYear()} {school?.name || 'ScholAI'} Digital Infrastructure
             </p>
             <div className="flex items-center gap-2">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">System powered by</span>
               <span className="text-[10px] font-black tracking-tighter text-white">NEXORA</span>
             </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

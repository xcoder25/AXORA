'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogOut, Building, User, Sparkles, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function AxoraLogo() {
  return (
    <div className="relative group">
      <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-[0_0_20px_rgba(218,165,32,0.3)]">
        <defs>
          <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
            <stop offset="20%" style={{ stopColor: '#FFF8DC', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#DAA520', stopOpacity: 1 }} />
            <stop offset="80%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Stylized 'A' paths mimicking the uploaded logo shape */}
        <path 
          d="M50 15 L85 85 Q70 78 50 78 Q30 78 15 85 Z" 
          fill="url(#gold-metallic)" 
          className="animate-in fade-in zoom-in-95 duration-1000"
        />
        <path 
          d="M25 65 Q50 50 75 65" 
          stroke="url(#gold-metallic)" 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round"
          className="animate-pulse duration-[3000ms]"
        />
        <circle cx="50" cy="40" r="2" fill="white" className="animate-ping opacity-20" />
      </svg>
      <div className="absolute inset-0 gold-shine-sweep rounded-full pointer-events-none" />
    </div>
  );
}

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
      const timer = setTimeout(() => setBooting(false), 2500); // Extended for beauty
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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
        {/* Atmospheric Splash Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,165,32,0.05)_0%,transparent_70%)] animate-pulse" />
        
        <div className="relative flex flex-col items-center gap-10 animate-in fade-in zoom-in-95 duration-1000">
          <AxoraLogo />
          
          <div className="text-center space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-5xl font-bold tracking-[0.25em] text-white text-gold-glow uppercase">
                AXORA
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground/60">
                Institutional OS
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Synchronizing Neural Nodes
                </span>
              </div>
              
              <div className="mt-12 flex flex-col items-center gap-1">
                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">
                  powered by
                </p>
                <span className="text-[11px] font-bold tracking-widest text-white/40 uppercase">
                  NEXORA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient light flares */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse delay-700" />
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
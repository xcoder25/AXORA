'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogOut, Building, User, Sparkles, GraduationCap, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function AxoraLogo() {
  return (
    <div className="relative group">
      <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <defs>
          <linearGradient id="axora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Core Logo Path branded to App Colors */}
        <path 
          d="M50 15 L85 85 Q70 78 50 78 Q30 78 15 85 Z" 
          fill="url(#axora-gradient)" 
          className="animate-in fade-in zoom-in-95 duration-1000"
        />
        <path 
          d="M25 65 Q50 50 75 65" 
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round"
          className="opacity-40 animate-pulse duration-[3000ms]"
        />
        <circle cx="50" cy="40" r="3" fill="white" className="animate-ping opacity-30" />
      </svg>
      <div className="absolute inset-0 brand-shine-sweep rounded-full pointer-events-none" />
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
    // Show splash screen for exactly 5 seconds on every mount/reload
    const timer = setTimeout(() => {
      // Only stop booting once data is also ready, but at least 5s has passed
      if (!authLoading && !profileLoading && (!profile?.schoolId || !schoolLoading)) {
        setBooting(false);
      }
    }, 5000); 
    
    return () => clearTimeout(timer);
  }, [authLoading, profileLoading, schoolLoading, profile]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (booting || authLoading || (user && (profileLoading || (profile?.schoolId && schoolLoading)))) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#010206] relative overflow-hidden">
        {/* Immersive Brand Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08)_0%,transparent_70%)] animate-pulse" />
        
        {/* Animated Background Layers to match App Theme */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none animate-blob animation-delay-2000" />
        
        <div className="relative flex flex-col items-center gap-12 animate-in fade-in zoom-in-95 duration-1000 z-10">
          <AxoraLogo />
          
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="font-headline text-6xl font-black tracking-[0.3em] text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                AXORA
              </h2>
              <div className="flex items-center justify-center gap-3">
                 <div className="h-px w-8 bg-primary/50" />
                 <p className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary">
                   Institutional OS
                 </p>
                 <div className="h-px w-8 bg-primary/50" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Synchronizing Neural Nodes
                </span>
              </div>
              
              <div className="mt-16 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">
                  powered by
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-[0.2em] text-white uppercase">
                    NEXORA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite alternate;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .brand-shine-sweep::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            background: linear-gradient(
              to right,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shine 3s infinite ease-in-out;
          }
          @keyframes shine {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
        `}</style>
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


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogOut, ShieldCheck, Building, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
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

  if (authLoading || (user && (profileLoading || (profile?.schoolId && schoolLoading)))) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#02040a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Verifying Identity...</p>
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
      <DashboardSidebar userRole={profile?.role || 'student'} />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-xl px-6">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-white" />
          <Separator orientation="vertical" className="mx-2 h-4 opacity-20" />
          
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-accent" />
              <span className="font-headline text-sm font-bold tracking-tight text-white">{school?.name || 'Loading Institution...'}</span>
              <Badge variant="outline" className="text-[9px] font-black tracking-widest border-white/10 text-muted-foreground uppercase h-5">
                {profile?.schoolId || 'N/A'}
              </Badge>
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
                className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title="Secure Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 md:p-10 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

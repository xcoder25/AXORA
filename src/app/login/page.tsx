
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Building2, KeyRound, User, Users, ShieldCheck, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'deploy-institution' | 'join-parent'>('login');
  const [loginRole, setLoginRole] = useState<'admin' | 'teacher' | 'student'>('student');
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);
    try {
      if (authMode === 'deploy-institution') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const generatedSchoolId = `SCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        await setDoc(doc(db, 'schools', generatedSchoolId), {
          id: generatedSchoolId,
          name: schoolName,
          adminUid: result.user.uid,
          createdAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: 'admin',
          schoolId: generatedSchoolId,
          createdAt: new Date().toISOString(),
        });
      } else if (authMode === 'join-parent') {
        const schoolSnap = await getDoc(doc(db, 'schools', schoolId));
        if (!schoolSnap.exists()) {
          alert('Institutional ID not found. Please contact the school office.');
          setLoading(false);
          return;
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: 'parent',
          schoolId: schoolId,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Standard login - Role is fetched automatically by Dashboard layout
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#02040a]">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-lg glass-card animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3">
              <GraduationCap className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black font-headline tracking-tighter text-white">
            ScholAI <span className="text-accent text-glow">Enterprise</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Next-Generation Intelligence for Modern Institutions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1 h-12">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary">Access</TabsTrigger>
              <TabsTrigger value="join-parent" className="rounded-lg data-[state=active]:bg-primary">Parent Join</TabsTrigger>
              <TabsTrigger value="deploy-institution" className="rounded-lg data-[state=active]:bg-accent">Deploy</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="mt-6 space-y-6">
              {authMode === 'login' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Identify Your Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'admin', icon: ShieldCheck, label: 'Admin' },
                      { id: 'teacher', icon: Users, label: 'Faculty' },
                      { id: 'student', icon: GraduationCap, label: 'Scholar' }
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setLoginRole(role.id as any)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                          loginRole === role.id 
                            ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10" 
                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        <role.icon className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {authMode === 'deploy-institution' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Institutional Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Stanford Academy"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {authMode === 'join-parent' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <Heart className="h-5 w-5 text-accent" />
                    <p className="text-xs font-medium text-accent">Parent account activation requires a valid School ID.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">School ID</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. SCH-XXXXXX"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Credentials</Label>
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-11 rounded-xl"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 font-bold shadow-xl transition-all rounded-xl mt-4",
                  authMode === 'deploy-institution' ? "bg-accent hover:bg-accent/90 shadow-accent/20" : "bg-primary shadow-primary/20"
                )} 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                  authMode === 'login' ? `Access as ${loginRole.toUpperCase()}` : 
                  authMode === 'join-parent' ? "Join as Guardian" : "Initialize Institution"
                }
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center border-t border-white/5 pt-6 mt-2">
          <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
            Institutional Cloud Infrastructure • Verified
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

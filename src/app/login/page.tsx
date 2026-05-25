
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, UserCheck, ShieldCheck, Building2, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register-school' | 'join-school'>('login');
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);
    try {
      if (authMode === 'register-school') {
        // Create Admin & School
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
      } else if (authMode === 'join-school') {
        // Check if school exists
        const schoolSnap = await getDoc(doc(db, 'schools', schoolId));
        if (!schoolSnap.exists()) {
          alert('School ID not found. Please contact your administrator.');
          setLoading(false);
          return;
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: 'student', // Default joiner role
          schoolId: schoolId,
          createdAt: new Date().toISOString(),
        });
      } else {
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

      <Card className="w-full max-w-md glass-card animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3">
              <GraduationCap className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black font-headline tracking-tighter text-white">
            ScholAI <span className="text-accent text-glow">SaaS</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Institutional Intelligence Portal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1 h-12">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary">Login</TabsTrigger>
              <TabsTrigger value="join-school" className="rounded-lg data-[state=active]:bg-primary">Join</TabsTrigger>
              <TabsTrigger value="register-school" className="rounded-lg data-[state=active]:bg-accent">Deploy</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="mt-6 space-y-4">
              {authMode === 'register-school' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">School Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Stanford Academy"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-11 pl-10"
                    />
                  </div>
                </div>
              )}

              {authMode === 'join-school' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">School ID</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. SCH-XXXXXX"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-11 pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 font-bold shadow-xl shadow-primary/20 mt-2" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                  authMode === 'login' ? "Access Dashboard" : 
                  authMode === 'join-school' ? "Join Institution" : "Initialize School Registry"
                }
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-[0.2em]">
            Secured Institutional Cloud • AES-256 Verified
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

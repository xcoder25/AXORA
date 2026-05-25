
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Building2, KeyRound, User, Users, ShieldCheck, Heart, Sparkles, Globe, MapPin, Settings2, Wallet, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'deploy-institution' | 'join-parent'>('login');
  const [loginRole, setLoginRole] = useState<'admin' | 'teacher' | 'student'>('student');
  
  // Basic Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Deployment State
  const [deployStep, setDeployStep] = useState('basic');
  const [schoolData, setSchoolData] = useState({
    name: '',
    shortName: '',
    type: 'Combined',
    ownership: 'Private',
    motto: '',
    phone: '',
    officialEmail: '',
    country: '',
    city: '',
    academicSystem: 'Term System',
    numPeriods: '3',
    expectedPop: '',
    portalName: '',
    currency: 'USD',
    gateway: 'Stripe',
    modules: [] as string[]
  });

  // Join State
  const [schoolId, setSchoolId] = useState('');
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    if (authMode === 'deploy-institution' && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'deploy-institution') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const generatedSchoolId = `SCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        await setDoc(doc(db, 'schools', generatedSchoolId), {
          id: generatedSchoolId,
          name: schoolData.name,
          shortName: schoolData.shortName,
          type: schoolData.type,
          ownership: schoolData.ownership,
          motto: schoolData.motto,
          contact: {
            officialEmail: schoolData.officialEmail || email,
            phone: schoolData.phone
          },
          location: {
            country: schoolData.country,
            city: schoolData.city
          },
          academicStructure: {
            system: schoolData.academicSystem,
            count: parseInt(schoolData.numPeriods)
          },
          finance: {
            currency: schoolData.currency,
            gateway: schoolData.gateway
          },
          modules: schoolData.modules,
          adminUid: result.user.uid,
          createdAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: 'admin',
          schoolId: generatedSchoolId,
          displayName: schoolData.name + " Admin",
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

  const toggleModule = (mod: string) => {
    setSchoolData(prev => ({
      ...prev,
      modules: prev.modules.includes(mod) 
        ? prev.modules.filter(m => m !== mod) 
        : [...prev.modules, mod]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#02040a]">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <Card className={cn(
        "w-full glass-card animate-in fade-in zoom-in-95 duration-500",
        authMode === 'deploy-institution' ? "max-w-4xl" : "max-w-lg"
      )}>
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
            Intelligence-Driven Institutional Infrastructure
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1 h-12">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary">Access</TabsTrigger>
              <TabsTrigger value="join-parent" className="rounded-lg data-[state=active]:bg-primary">Guardian Join</TabsTrigger>
              <TabsTrigger value="deploy-institution" className="rounded-lg data-[state=active]:bg-accent">Deploy School</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="mt-6 space-y-6">
              {authMode === 'login' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Identify Your Role</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'admin', icon: ShieldCheck, label: 'Admin' },
                        { id: 'teacher', icon: Users, label: 'Teacher' },
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
                  <div className="space-y-4">
                    <Input type="email" placeholder="Institutional Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    <Input type="password" placeholder="Secure Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                  </div>
                </div>
              )}

              {authMode === 'join-parent' && (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <Heart className="h-5 w-5 text-accent" />
                    <p className="text-xs font-medium text-accent">Guardian activation requires a verified Institutional School ID.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="School ID (e.g. SCH-XXXXXX)" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl" />
                    </div>
                    <Input type="email" placeholder="Personal Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    <Input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                  </div>
                </div>
              )}

              {authMode === 'deploy-institution' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <Tabs value={deployStep} onValueChange={setDeployStep} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/5 border-white/10 rounded-xl h-10 mb-6">
                      <TabsTrigger value="basic" className="text-[9px] font-black uppercase tracking-widest">Info</TabsTrigger>
                      <TabsTrigger value="academic" className="text-[9px] font-black uppercase tracking-widest">Academic</TabsTrigger>
                      <TabsTrigger value="branding" className="text-[9px] font-black uppercase tracking-widest">Branding</TabsTrigger>
                      <TabsTrigger value="modules" className="text-[9px] font-black uppercase tracking-widest">Modules</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[450px] pr-4">
                      <TabsContent value="basic" className="space-y-6 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">School Name</Label>
                            <Input placeholder="Full Name" value={schoolData.name} onChange={e => setSchoolData({...schoolData, name: e.target.value})} className="bg-white/5 border-white/10" required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Short Name</Label>
                            <Input placeholder="E.g. SA" value={schoolData.shortName} onChange={e => setSchoolData({...schoolData, shortName: e.target.value})} className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Ownership</Label>
                            <Select value={schoolData.ownership} onValueChange={v => setSchoolData({...schoolData, ownership: v})}>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Private">Private</SelectItem><SelectItem value="Public">Public</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Established</Label>
                            <Input placeholder="Year" type="number" className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground">Admin Credentials</Label>
                          <Input type="email" placeholder="Login Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/10 mb-3" required />
                          <div className="grid grid-cols-2 gap-4">
                            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/5 border-white/10" required />
                            <Input type="password" placeholder="Confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10" required />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="academic" className="space-y-6 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Academic System</Label>
                            <Select value={schoolData.academicSystem} onValueChange={v => setSchoolData({...schoolData, academicSystem: v})}>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Term System">Term System</SelectItem><SelectItem value="Semester System">Semester System</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Periods Count</Label>
                            <Input type="number" value={schoolData.numPeriods} onChange={e => setSchoolData({...schoolData, numPeriods: e.target.value})} className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground">Educational Levels</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'].map(lvl => (
                              <div key={lvl} className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                <Checkbox id={lvl} />
                                <Label htmlFor={lvl} className="text-xs font-bold">{lvl}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="branding" className="space-y-6 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Preferred Subdomain</Label>
                            <div className="flex items-center gap-2">
                              <Input placeholder="schoolname" className="bg-white/5 border-white/10" />
                              <span className="text-[10px] font-bold text-muted-foreground">.scholai.io</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Portal Name</Label>
                            <Input placeholder="Branded Title" className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Finance Currency</Label>
                            <Select value={schoolData.currency} onValueChange={v => setSchoolData({...schoolData, currency: v})}>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="NGN">NGN (₦)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Payment Gateway</Label>
                            <Select value={schoolData.gateway} onValueChange={v => setSchoolData({...schoolData, gateway: v})}>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Stripe">Stripe</SelectItem><SelectItem value="Paystack">Paystack</SelectItem><SelectItem value="Flutterwave">Flutterwave</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="modules" className="space-y-6 mt-0">
                         <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: 'results', label: 'Result Management', icon: Sparkles },
                              { id: 'attendance', label: 'Attendance AI', icon: MapPin },
                              { id: 'cbt', label: 'CBT Exams', icon: Globe },
                              { id: 'library', label: 'Digital Library', icon: GraduationCap },
                              { id: 'payroll', label: 'Payroll & HR', icon: Wallet },
                              { id: 'elearning', label: 'E-Learning', icon: Building2 },
                              { id: 'ai-report', label: 'AI Report Gen', icon: Settings2 },
                              { id: 'transport', label: 'Transport Hub', icon: Globe }
                            ].map(mod => (
                              <div 
                                key={mod.id} 
                                onClick={() => toggleModule(mod.id)}
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                                  schoolData.modules.includes(mod.id)
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                              >
                                <mod.icon className="h-5 w-5 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-wider">{mod.label}</span>
                              </div>
                            ))}
                         </div>
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                </div>
              )}

              <Button 
                type="submit" 
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-lg shadow-2xl transition-all transform hover:scale-[1.02]",
                  authMode === 'deploy-institution' ? "bg-accent hover:bg-emerald-400 shadow-accent/20" : "bg-primary shadow-primary/20"
                )} 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 
                  authMode === 'login' ? `ACCESS AS ${loginRole.toUpperCase()}` : 
                  authMode === 'join-parent' ? "JOIN AS GUARDIAN" : "INITIALIZE ENTERPRISE INSTANCE"
                }
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center border-t border-white/5 pt-6 mt-2 pb-8">
          <div className="flex items-center gap-2 justify-center opacity-40">
            <Shield className="h-3 w-3" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em]">
              Cloud Infrastructure Secured by ScholAI
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

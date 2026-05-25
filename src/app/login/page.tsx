'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Building2, KeyRound, Users, ShieldCheck, Heart, Sparkles, Globe, Settings2, Wallet, Shield } from 'lucide-react';
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
    primaryColor: '#6366f1',
    secondaryColor: '#10b981',
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
          branding: {
            portalName: schoolData.portalName || schoolData.name,
            primaryColor: schoolData.primaryColor,
            secondaryColor: schoolData.secondaryColor
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#02040a]">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px]" />

      <Card className={cn(
        "w-full glass-card animate-in fade-in zoom-in-95 duration-700 relative z-10",
        authMode === 'deploy-institution' ? "max-w-4xl" : "max-w-lg"
      )}>
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-[0_0_40px_rgba(var(--primary),0.3)] rotate-6 transition-transform hover:rotate-0 duration-500">
              <GraduationCap className="h-12 w-12" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black font-headline tracking-tighter text-white">
              ScholAI <span className="text-accent text-glow">OS</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">
              Next-Gen Academic Intelligence Infrastructure
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="grid gap-6">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-2xl p-1.5 h-14">
              <TabsTrigger value="login" className="rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary">Secure Access</TabsTrigger>
              <TabsTrigger value="join-parent" className="rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary">Guardian Join</TabsTrigger>
              <TabsTrigger value="deploy-institution" className="rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-accent">Deploy Node</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="mt-8 space-y-6">
              {authMode === 'login' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-1">Select Security Clearance</Label>
                    <div className="grid grid-cols-3 gap-3">
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
                            "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all h-24",
                            loginRole === role.id 
                              ? "bg-primary/15 border-primary text-primary shadow-xl shadow-primary/5" 
                              : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/8"
                          )}
                        >
                          <role.icon className={cn("h-6 w-6", loginRole === role.id && "animate-pulse")} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{role.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional Email</Label>
                      <Input type="email" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/3 border-white/10 h-14 rounded-2xl px-6 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Access Token</Label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/3 border-white/10 h-14 rounded-2xl px-6 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>
              )}

              {authMode === 'join-parent' && (
                <div className="space-y-8 animate-in slide-in-from-top-4">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-accent/10 border border-accent/20">
                    <Heart className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-accent mb-1">Guardian Validation</h4>
                      <p className="text-[10px] font-medium text-accent/80 leading-relaxed">Please input the unique Institutional ID provided by your student's school registry office.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional ID</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="SCH-XXXXXX" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required className="bg-white/3 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Personal Email</Label>
                      <Input type="email" placeholder="parent@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/3 border-white/10 h-14 rounded-2xl px-6" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Secure Password</Label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/3 border-white/10 h-14 rounded-2xl px-6" />
                    </div>
                  </div>
                </div>
              )}

              {authMode === 'deploy-institution' && (
                <div className="animate-in fade-in slide-in-from-bottom-8">
                  <Tabs value={deployStep} onValueChange={setDeployStep} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/3 border-white/10 rounded-2xl h-12 mb-8 p-1">
                      <TabsTrigger value="basic" className="text-[9px] font-black uppercase tracking-widest rounded-xl">Basics</TabsTrigger>
                      <TabsTrigger value="academic" className="text-[9px] font-black uppercase tracking-widest rounded-xl">System</TabsTrigger>
                      <TabsTrigger value="branding" className="text-[9px] font-black uppercase tracking-widest rounded-xl">Brand</TabsTrigger>
                      <TabsTrigger value="modules" className="text-[9px] font-black uppercase tracking-widest rounded-xl">Ops</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[480px] pr-4">
                      <TabsContent value="basic" className="space-y-8 mt-0">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional Name</Label>
                            <Input placeholder="Global Academy" value={schoolData.name} onChange={e => setSchoolData({...schoolData, name: e.target.value})} className="bg-white/3 border-white/10 h-12 rounded-xl" required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Short Alias</Label>
                            <Input placeholder="E.g. GA" value={schoolData.shortName} onChange={e => setSchoolData({...schoolData, shortName: e.target.value})} className="bg-white/3 border-white/10 h-12 rounded-xl" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional Ownership</Label>
                            <Select value={schoolData.ownership} onValueChange={v => setSchoolData({...schoolData, ownership: v})}>
                              <SelectTrigger className="bg-white/3 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Private">Private Entity</SelectItem><SelectItem value="Public">Public/State</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Foundation Year</Label>
                            <Input placeholder="2024" type="number" className="bg-white/3 border-white/10 h-12 rounded-xl" />
                          </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Master Admin Identity</Label>
                          <Input type="email" placeholder="Super-admin Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/3 border-white/10 h-12 rounded-xl" required />
                          <div className="grid grid-cols-2 gap-4">
                            <Input type="password" placeholder="Access Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/3 border-white/10 h-12 rounded-xl" required />
                            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white/3 border-white/10 h-12 rounded-xl" required />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="academic" className="space-y-8 mt-0">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Academic Engine</Label>
                            <Select value={schoolData.academicSystem} onValueChange={v => setSchoolData({...schoolData, academicSystem: v})}>
                              <SelectTrigger className="bg-white/3 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Term System">Term-Based (Trimesters)</SelectItem><SelectItem value="Semester System">Semester-Based</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Cycles Per Year</Label>
                            <Input type="number" value={schoolData.numPeriods} onChange={e => setSchoolData({...schoolData, numPeriods: e.target.value})} className="bg-white/3 border-white/10 h-12 rounded-xl" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Educational Levels Covered</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'].map(lvl => (
                              <div key={lvl} className="flex items-center space-x-3 bg-white/3 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <Checkbox id={lvl} className="rounded-md h-5 w-5 border-white/20" />
                                <Label htmlFor={lvl} className="text-xs font-bold">{lvl}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="branding" className="space-y-8 mt-0">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional Subdomain</Label>
                            <div className="flex items-center gap-2">
                              <Input placeholder="alias" className="bg-white/3 border-white/10 h-12 rounded-xl" />
                              <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">.scholai.os</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional Motto</Label>
                            <Input placeholder="Knowledge is Power" className="bg-white/3 border-white/10 h-12 rounded-xl" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Primary Brand Color</Label>
                            <div className="flex items-center gap-3 bg-white/3 p-3 rounded-xl border border-white/10">
                              <input type="color" value={schoolData.primaryColor} onChange={e => setSchoolData({...schoolData, primaryColor: e.target.value})} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                              <span className="text-[10px] font-mono font-bold uppercase">{schoolData.primaryColor}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional Currency</Label>
                            <Select value={schoolData.currency} onValueChange={v => setSchoolData({...schoolData, currency: v})}>
                              <SelectTrigger className="bg-white/3 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="USD">USD ($) - Global</SelectItem><SelectItem value="NGN">NGN (₦) - Nigeria</SelectItem><SelectItem value="GBP">GBP (£) - UK</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="modules" className="space-y-6 mt-0">
                         <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: 'results', label: 'Result Intelligence', icon: Sparkles },
                              { id: 'attendance', label: 'Attendance Hub', icon: Globe },
                              { id: 'cbt', label: 'Digital Exams (CBT)', icon: Globe },
                              { id: 'library', label: 'Scholarly Archive', icon: GraduationCap },
                              { id: 'payroll', label: 'Fiscal/Payroll', icon: Wallet },
                              { id: 'elearning', label: 'Remote Learning', icon: Building2 },
                              { id: 'ai-report', label: 'AI Cognition Gen', icon: Settings2 },
                              { id: 'transport', label: 'Logistics Node', icon: Globe }
                            ].map(mod => (
                              <div 
                                key={mod.id} 
                                onClick={() => toggleModule(mod.id)}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all h-20",
                                  schoolData.modules.includes(mod.id)
                                    ? "bg-accent/20 border-accent text-accent shadow-lg shadow-accent/5"
                                    : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/8 hover:border-white/20"
                                )}
                              >
                                <mod.icon className="h-6 w-6 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-snug">{mod.label}</span>
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
                  "w-full h-16 rounded-[1.5rem] font-black text-lg shadow-2xl transition-all transform hover:scale-[1.01] active:scale-[0.98] group",
                  authMode === 'deploy-institution' ? "bg-accent hover:bg-emerald-400 shadow-accent/20 text-accent-foreground" : "bg-primary shadow-primary/20 text-white"
                )} 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : (
                  <div className="flex items-center gap-3">
                    {authMode === 'login' ? `AUTHENTICATE AS ${loginRole.toUpperCase()}` : 
                     authMode === 'join-parent' ? "INITIATE GUARDIAN LINK" : "INITIALIZE ENTERPRISE INSTANCE"}
                    <Sparkles className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                  </div>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-6 text-center border-t border-white/5 pt-10 mt-4 pb-10">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity duration-700">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                Digital Infrastructure Managed by <span className="text-white">NEXORA</span>
              </p>
            </div>
            <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
              Security Node: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.toUpperCase() || 'PROD-CL-01'}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

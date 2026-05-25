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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
          alert('Institutional ID not found.');
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
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-lg rotate-3 transition-transform hover:rotate-0 duration-500">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              ScholAI <span className="text-accent text-glow">OS</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              Academic Intelligence Infrastructure
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="grid gap-6">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1 h-12">
              <TabsTrigger value="login" className="rounded-lg font-semibold uppercase tracking-wider text-[10px] data-[state=active]:bg-primary">Access</TabsTrigger>
              <TabsTrigger value="join-parent" className="rounded-lg font-semibold uppercase tracking-wider text-[10px] data-[state=active]:bg-primary">Parent</TabsTrigger>
              <TabsTrigger value="deploy-institution" className="rounded-lg font-semibold uppercase tracking-wider text-[10px] data-[state=active]:bg-accent">Deploy</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="mt-8 space-y-6">
              {authMode === 'login' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">Security Clearance</Label>
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
                            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all h-20",
                            loginRole === role.id 
                              ? "bg-primary/10 border-primary/50 text-primary" 
                              : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/8"
                          )}
                        >
                          <role.icon className="h-5 w-5" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">{role.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                      <Input type="email" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/3 border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/3 border-white/10 h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              {authMode === 'join-parent' && (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <Heart className="h-5 w-5 text-accent shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">Guardian Validation</h4>
                      <p className="text-[10px] text-accent/70 leading-relaxed">Enter the unique ID provided by your school's registry office.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Institutional ID</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input placeholder="SCH-XXXXXX" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required className="bg-white/3 border-white/10 h-12 pl-10 rounded-xl" />
                      </div>
                    </div>
                    <Input type="email" placeholder="Parent Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/3 border-white/10 h-12 rounded-xl" />
                    <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/3 border-white/10 h-12 rounded-xl" />
                  </div>
                </div>
              )}

              {authMode === 'deploy-institution' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <Tabs value={deployStep} onValueChange={setDeployStep} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/3 border-white/10 rounded-xl h-10 mb-6 p-1">
                      <TabsTrigger value="basic" className="text-[9px] font-semibold uppercase tracking-wider">Info</TabsTrigger>
                      <TabsTrigger value="academic" className="text-[9px] font-semibold uppercase tracking-wider">System</TabsTrigger>
                      <TabsTrigger value="branding" className="text-[9px] font-semibold uppercase tracking-wider">Brand</TabsTrigger>
                      <TabsTrigger value="modules" className="text-[9px] font-semibold uppercase tracking-wider">Ops</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[400px] pr-4">
                      <TabsContent value="basic" className="space-y-6 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="School Name" value={schoolData.name} onChange={e => setSchoolData({...schoolData, name: e.target.value})} className="bg-white/3 border-white/10 h-11 rounded-xl" required />
                          <Input placeholder="Short Alias (GA)" value={schoolData.shortName} onChange={e => setSchoolData({...schoolData, shortName: e.target.value})} className="bg-white/3 border-white/10 h-11 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Select value={schoolData.ownership} onValueChange={v => setSchoolData({...schoolData, ownership: v})}>
                            <SelectTrigger className="bg-white/3 border-white/10 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Private">Private</SelectItem><SelectItem value="Public">Public</SelectItem></SelectContent>
                          </Select>
                          <Input placeholder="Founded Year" type="number" className="bg-white/3 border-white/10 h-11 rounded-xl" />
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <Label className="text-[10px] font-semibold uppercase tracking-widest text-primary">Admin Identity</Label>
                          <Input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/3 border-white/10 h-11 rounded-xl" required />
                          <div className="grid grid-cols-2 gap-4">
                            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/3 border-white/10 h-11 rounded-xl" required />
                            <Input type="password" placeholder="Confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white/3 border-white/10 h-11 rounded-xl" required />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="academic" className="space-y-6 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <Select value={schoolData.academicSystem} onValueChange={v => setSchoolData({...schoolData, academicSystem: v})}>
                            <SelectTrigger className="bg-white/3 border-white/10 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Term System">Trimesters</SelectItem><SelectItem value="Semester System">Semesters</SelectItem></SelectContent>
                          </Select>
                          <Input type="number" placeholder="Cycles" value={schoolData.numPeriods} onChange={e => setSchoolData({...schoolData, numPeriods: e.target.value})} className="bg-white/3 border-white/10 h-11 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'].map(lvl => (
                            <div key={lvl} className="flex items-center space-x-2 bg-white/3 p-3 rounded-xl border border-white/5">
                              <Checkbox id={lvl} className="h-4 w-4 border-white/20" />
                              <Label htmlFor={lvl} className="text-xs">{lvl}</Label>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="branding" className="space-y-6 mt-0">
                        <Input placeholder="Motto" value={schoolData.motto} onChange={e => setSchoolData({...schoolData, motto: e.target.value})} className="bg-white/3 border-white/10 h-11 rounded-xl" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 bg-white/3 p-3 rounded-xl border border-white/10">
                            <input type="color" value={schoolData.primaryColor} onChange={e => setSchoolData({...schoolData, primaryColor: e.target.value})} className="w-6 h-6 rounded-md bg-transparent border-none cursor-pointer" />
                            <span className="text-[10px] font-mono">{schoolData.primaryColor}</span>
                          </div>
                          <Select value={schoolData.currency} onValueChange={v => setSchoolData({...schoolData, currency: v})}>
                            <SelectTrigger className="bg-white/3 border-white/10 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="NGN">NGN (₦)</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </TabsContent>

                      <TabsContent value="modules" className="space-y-4 mt-0">
                         <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'results', label: 'Results', icon: Sparkles },
                              { id: 'attendance', label: 'Attendance', icon: Globe },
                              { id: 'cbt', label: 'CBT Exams', icon: Globe },
                              { id: 'payroll', label: 'Payroll', icon: Wallet },
                              { id: 'elearning', label: 'E-Learning', icon: Building2 },
                              { id: 'ai-report', label: 'AI Insights', icon: Settings2 }
                            ].map(mod => (
                              <div 
                                key={mod.id} 
                                onClick={() => toggleModule(mod.id)}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                  schoolData.modules.includes(mod.id)
                                    ? "bg-accent/10 border-accent/50 text-accent"
                                    : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/8"
                                )}
                              >
                                <mod.icon className="h-4 w-4 shrink-0" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">{mod.label}</span>
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
                  "w-full h-14 rounded-xl font-bold text-base transition-all active:scale-[0.98]",
                  authMode === 'deploy-institution' ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-primary hover:bg-primary/90 text-white"
                )} 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    {authMode === 'login' ? `Login as ${loginRole}` : 
                     authMode === 'join-parent' ? "Join as Guardian" : "Initialize Institution"}
                  </div>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center border-t border-white/5 pt-8 mt-4 pb-8">
          <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Powered by <span className="text-white">NEXORA</span>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
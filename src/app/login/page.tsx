'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Loader2, 
  KeyRound, 
  Users, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Globe, 
  Settings2, 
  Wallet, 
  Shield,
  Camera,
  Video,
  ShieldAlert,
  Bus,
  Laptop,
  Box,
  ArrowRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
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
    foundedYear: '',
    motto: '',
    phone: '',
    officialEmail: '',
    country: '',
    city: '',
    academicSystem: 'Term System',
    numPeriods: '3',
    levels: [] as string[],
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

    if (authMode === 'deploy-institution') {
      if (deployStep === 'basic') {
        setDeployStep('academic');
        return;
      }
      if (deployStep === 'academic') {
        setDeployStep('branding');
        return;
      }
      if (deployStep === 'branding') {
        setDeployStep('modules');
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
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
          foundedYear: schoolData.foundedYear,
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
            count: parseInt(schoolData.numPeriods),
            levels: schoolData.levels
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

  const updateSchoolField = useCallback((field: string, value: any) => {
    setSchoolData(prev => {
      if ((prev as any)[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const toggleModule = useCallback((mod: string) => {
    setSchoolData(prev => ({
      ...prev,
      modules: prev.modules.includes(mod) 
        ? prev.modules.filter(m => m !== mod) 
        : [...prev.modules, mod]
    }));
  }, []);

  const toggleLevel = useCallback((lvl: string) => {
    setSchoolData(prev => ({
      ...prev,
      levels: prev.levels.includes(lvl)
        ? prev.levels.filter(l => l !== lvl)
        : [...prev.levels, lvl]
    }));
  }, []);

  const availableModules = [
    { id: 'results', label: 'Result Management', icon: Sparkles },
    { id: 'attendance', label: 'Attendance', icon: Globe },
    { id: 'ai-attendance', label: 'AI Attendance Recognition', icon: Camera },
    { id: 'cam-integration', label: 'CAM Integration', icon: Video },
    { id: 'payroll', label: 'Payroll', icon: Wallet },
    { id: 'ai-report', label: 'AI Insights', icon: Settings2 },
    { id: 'exam-proctoring', label: 'AI Exam Proctoring', icon: ShieldAlert },
    { id: 'fleet', label: 'Fleet Management', icon: Bus },
    { id: 'e-learning', label: 'E-Learning Core', icon: Laptop },
    { id: 'inventory', label: 'Inventory & Assets', icon: Box },
    { id: 'parent-portal', label: 'Parent Engagement', icon: Heart }
  ];

  const academicLevels = ['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-transparent">
      <Card className={cn(
        "w-full glass-card animate-in fade-in zoom-in-95 duration-700 relative z-10 transition-all",
        authMode === 'deploy-institution' ? "max-w-xl" : "max-w-md"
      )}>
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-1">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-lg rotate-3 transition-transform hover:rotate-0 duration-500">
              <GraduationCap className="h-7 w-7" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Axora <span className="text-accent text-glow">OS</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
              Academic Intelligence Infrastructure
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1 h-11">
              <TabsTrigger value="login" className="rounded-lg font-semibold uppercase tracking-wider text-[9px] data-[state=active]:bg-primary">Access</TabsTrigger>
              <TabsTrigger value="join-parent" className="rounded-lg font-semibold uppercase tracking-wider text-[9px] data-[state=active]:bg-primary">Parent</TabsTrigger>
              <TabsTrigger value="deploy-institution" className="rounded-lg font-semibold uppercase tracking-wider text-[9px] data-[state=active]:bg-accent">Deploy</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="mt-6 space-y-4">
              {authMode === 'login' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">Clearance Level</Label>
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
                            "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all h-16",
                            loginRole === role.id 
                              ? "bg-primary/10 border-primary/50 text-primary" 
                              : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/8"
                          )}
                        >
                          <role.icon className="h-4 w-4" />
                          <span className="text-[9px] font-semibold uppercase tracking-wider">{role.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                      <Input type="email" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/3 border-white/10 h-11 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/3 border-white/10 h-11 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              {authMode === 'join-parent' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                    <Heart className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-accent mb-0.5">Guardian Validation</h4>
                      <p className="text-[9px] text-accent/70 leading-relaxed">Enter your school's unique ID.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Institutional ID</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                        <Input placeholder="SCH-XXXXXX" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required className="bg-white/3 border-white/10 h-11 pl-10 rounded-xl" />
                      </div>
                    </div>
                    <Input type="email" placeholder="Parent Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/3 border-white/10 h-11 rounded-xl" />
                    <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/3 border-white/10 h-11 rounded-xl" />
                  </div>
                </div>
              )}

              {authMode === 'deploy-institution' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <Tabs value={deployStep} onValueChange={setDeployStep} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/3 border-white/10 rounded-xl h-9 mb-4 p-1">
                      <TabsTrigger value="basic" className="text-[8px] font-semibold uppercase tracking-wider">Info</TabsTrigger>
                      <TabsTrigger value="academic" className="text-[8px] font-semibold uppercase tracking-wider">System</TabsTrigger>
                      <TabsTrigger value="branding" className="text-[8px] font-semibold uppercase tracking-wider">Brand</TabsTrigger>
                      <TabsTrigger value="modules" className="text-[8px] font-semibold uppercase tracking-wider">Ops</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[350px] pr-2">
                      <TabsContent value="basic" className="space-y-4 mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input 
                            placeholder="School Name" 
                            value={schoolData.name} 
                            onChange={e => updateSchoolField('name', e.target.value)} 
                            className="bg-white/3 border-white/10 h-10 rounded-xl" 
                            required={deployStep === 'basic'} 
                          />
                          <Input 
                            placeholder="Short Alias (GA)" 
                            value={schoolData.shortName} 
                            onChange={e => updateSchoolField('shortName', e.target.value)} 
                            className="bg-white/3 border-white/10 h-10 rounded-xl" 
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Select 
                            value={schoolData.ownership} 
                            onValueChange={v => updateSchoolField('ownership', v)}
                          >
                            <SelectTrigger className="bg-white/3 border-white/10 h-10 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="Private">Private</SelectItem>
                                <SelectItem value="Public">Public</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Input 
                            placeholder="Founded Year" 
                            type="number" 
                            value={schoolData.foundedYear} 
                            onChange={e => updateSchoolField('foundedYear', e.target.value)} 
                            className="bg-white/3 border-white/10 h-10 rounded-xl" 
                          />
                        </div>
                        <div className="space-y-3 pt-3 border-t border-white/5">
                          <Label className="text-[9px] font-semibold uppercase tracking-widest text-primary">Admin Credentials</Label>
                          <Input 
                            type="email" 
                            placeholder="Admin Email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="bg-white/3 border-white/10 h-10 rounded-xl" 
                            required={deployStep === 'basic'} 
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input 
                              type="password" 
                              placeholder="Password" 
                              value={password} 
                              onChange={e => setPassword(e.target.value)} 
                              className="bg-white/3 border-white/10 h-10 rounded-xl" 
                              required={deployStep === 'basic'} 
                            />
                            <Input 
                              type="password" 
                              placeholder="Confirm" 
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              className="bg-white/3 border-white/10 h-10 rounded-xl" 
                              required={deployStep === 'basic'} 
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="academic" className="space-y-4 mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Select 
                            value={schoolData.academicSystem} 
                            onValueChange={v => updateSchoolField('academicSystem', v)}
                          >
                            <SelectTrigger className="bg-white/3 border-white/10 h-10 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="Term System">Trimesters</SelectItem>
                                <SelectItem value="Semester System">Semesters</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Input type="number" placeholder="Cycles" value={schoolData.numPeriods} onChange={e => updateSchoolField('numPeriods', e.target.value)} className="bg-white/3 border-white/10 h-10 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {academicLevels.map(lvl => (
                            <div 
                              key={lvl} 
                              onClick={() => toggleLevel(lvl)}
                              className={cn(
                                "flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-all",
                                schoolData.levels.includes(lvl)
                                  ? "bg-primary/10 border-primary/50 text-primary"
                                  : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/8"
                              )}
                            >
                              <Checkbox checked={schoolData.levels.includes(lvl)} onCheckedChange={() => {}} className="h-3.5 w-3.5 border-white/20 pointer-events-none" />
                              <Label className="text-[10px] cursor-pointer pointer-events-none">{lvl}</Label>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="branding" className="space-y-4 mt-0">
                        <Input placeholder="Motto" value={schoolData.motto} onChange={e => updateSchoolField('motto', e.target.value)} className="bg-white/3 border-white/10 h-10 rounded-xl" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 bg-white/3 p-2.5 rounded-xl border border-white/10">
                            <input type="color" value={schoolData.primaryColor} onChange={e => updateSchoolField('primaryColor', e.target.value)} className="w-5 h-5 rounded-md bg-transparent border-none cursor-pointer" />
                            <span className="text-[9px] font-mono">{schoolData.primaryColor}</span>
                          </div>
                          <Select 
                            value={schoolData.currency} 
                            onValueChange={v => updateSchoolField('currency', v)}
                          >
                            <SelectTrigger className="bg-white/3 border-white/10 h-10 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="NGN">NGN (₦)</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>

                      <TabsContent value="modules" className="space-y-3 mt-0">
                         <div className="grid grid-cols-2 gap-2">
                            {availableModules.map(mod => (
                              <div 
                                key={mod.id} 
                                onClick={() => toggleModule(mod.id)}
                                className={cn(
                                  "flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all",
                                  schoolData.modules.includes(mod.id)
                                    ? "bg-accent/10 border-accent/50 text-accent"
                                    : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/8"
                                )}
                              >
                                <mod.icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-left leading-tight">{mod.label}</span>
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
                  "w-full h-12 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg",
                  authMode === 'deploy-institution' ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/20" : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                )} 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    {authMode === 'login' ? `Login as ${loginRole}` : 
                     authMode === 'join-parent' ? "Join as Guardian" : 
                     (deployStep === 'modules' ? "Initialize Institution" : (
                       <>Next Step <ArrowRight className="h-4 w-4 ml-1" /></>
                     ))}
                  </div>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center border-t border-white/5 pt-6 mt-2 pb-6">
          <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <Shield className="h-2.5 w-2.5 text-muted-foreground" />
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              powered by <span className="text-white">NEXORA</span>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

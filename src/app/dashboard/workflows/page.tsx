"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, Eye, ShieldCheck, HeartHandshake, CheckCircle2, ChevronRight, 
  ChevronLeft, Play, Sparkles, Brain, Award, Zap, DollarSign, Camera
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function GuideSystemPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const guideScreens = [
    {
      title: "CCTV & Surveillance Layer",
      subtitle: "Multi-Brand LAN Edge Integration",
      badge: "Active Telemetry Hub",
      icon: Camera,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      description: "Axora integrates standard RTSP protocols, ONVIF discovery, and multi-brand hardware adaptors directly within your campus subnet network environment.",
      bullets: [
        "Normalizes feeds via low-latency go2rtc WebRTC streams",
        "Axis, Hikvision, Dahua, and Hanwha priority adaptors",
        "Edge YOLOv8 deep vision AI pipeline filters object logs",
        "Self-contained zero-bandwidth local streaming proxy"
      ],
      tip: "💡 Keep this service deployed on the local LAN close to your camera subnet to minimize roundtrip internet bandwidth!"
    },
    {
      title: "AI Attendance & Facial Nodes",
      subtitle: "Deep Vision Proctoring Registry",
      badge: "Neural Analysis Unit",
      icon: Brain,
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
      description: "Our proctoring engine uses real-time webcam snapshots matched against Google Genkit image descriptors to guarantee test integrity.",
      bullets: [
        "Tracks student gaze, multiple occupants, and device logs",
        "Logs telemetry flags automatically inside Firestore databases",
        "Self-learning models adapt to changing ambient light",
        "Slashes manual verification times down to mere seconds"
      ],
      tip: "💡 Enable browser webcam permissions prior to initiating proctored examinations to allow automated verification."
    },
    {
      title: "AI Question Architect & CBT Engine",
      subtitle: "Dynamic Assessment Synthesizer",
      badge: "Assessment Node",
      icon: Award,
      color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
      description: "Instructors can immediately build high-fidelity computer-based tests out of raw course syllabus texts using our generative question architecture.",
      bullets: [
        "Builds detailed multiple-choice sets with distinct distractors",
        "Pre-constructs correct-answer keys and inline explanations",
        "Synchronizes directly with active Student Exam portals",
        "Custom difficulty thresholds: Easy, Medium, or Hard"
      ],
      tip: "💡 Paste comprehensive curriculum syllabi into the intake box to generate more contextually robust quizzes!"
    },
    {
      title: "Finance & Balance Reconciliation",
      subtitle: "Ledger Splits & Smart Auto-Discounts",
      badge: "Fiscal Command Hub",
      icon: DollarSign,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      description: "Configure asset routing parameters and automated discount matrices to reconcile institutional receivables effortlessly.",
      bullets: [
        "One-click reconciliation logs with partial balance adjustments",
        "Dynamic sliding split ratios for core tuition and PTA pools",
        "Autonomous sibling and merit board scholarship deductions",
        "Instant smartphone payment link generation triggers"
      ],
      tip: "💡 Changes made to sliding fee splits apply immediately to all newly created student invoices."
    }
  ];

  const totalSteps = guideScreens.length;
  const current = guideScreens[currentStep];
  const StepIcon = current.icon;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[9px] font-bold">
              Institutional User Manual
            </Badge>
            <Sparkles className="h-3 w-3 text-accent animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">System Guides</h2>
          <p className="text-muted-foreground text-lg">Four critical modules deconstructed with interactive telemetry workflows.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          {guideScreens.map((screen, idx) => {
            const ActiveIcon = screen.icon;
            const isSelected = idx === currentStep;
            return (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group",
                  isSelected
                    ? "bg-primary/25 border-primary/60 text-white shadow-lg shadow-primary/10"
                    : "bg-white/3 border-white/5 text-white/70 hover:bg-white/8 hover:border-white/20"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-105",
                  isSelected ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                )}>
                  <ActiveIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{screen.title}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{screen.subtitle}</p>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 shrink-0 transition-all",
                  isSelected ? "text-primary opacity-100 translate-x-0" : "text-muted-foreground/30 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                )} />
              </button>
            );
          })}
        </div>

        {/* Dynamic Showcase Container */}
        <div className="lg:col-span-8">
          <Card className="glass-card border-none overflow-hidden h-full flex flex-col justify-between">
            <CardHeader className="bg-white/3 border-b border-white/5 p-8">
              <div className="flex justify-between items-center mb-4">
                <Badge className={cn("text-[9px] font-bold uppercase tracking-widest h-6 px-3 rounded-xl border flex items-center gap-1.5", current.color)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {current.badge}
                </Badge>
                <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <StepIcon className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white leading-tight">{current.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-0.5">{current.subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6 flex-1">
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                {current.description}
              </p>

              <div className="space-y-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">Core Capabilities</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {current.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-white/90 leading-relaxed font-medium">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 italic leading-relaxed font-medium">
                {current.tip}
              </div>
            </CardContent>

            <CardFooter className="p-6 border-t border-white/5 bg-white/3 flex items-center justify-between">
              <Progress value={((currentStep + 1) / totalSteps) * 100} className="w-1/3 h-1.5" />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className="rounded-xl border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-widest h-10 px-4"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
                </Button>
                {currentStep < totalSteps - 1 ? (
                  <Button 
                    onClick={nextStep}
                    className="rounded-xl h-10 px-5 text-[9px] font-bold uppercase tracking-widest"
                  >
                    Next Guide <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setCurrentStep(0)}
                    className="rounded-xl h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-widest"
                  >
                    Restart Guide <Zap className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Shield, BrainCircuit, Activity, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppGuideScreenProps = {
  onComplete: () => void;
};

const onboardingSlides = [
  {
    title: 'Secured Telemetry',
    description: 'Biometric registry & neural threat monitoring protecting your campus node in real time.',
    icon: Shield,
    color: 'from-violet-500 to-indigo-600',
    glow: 'rgba(99, 102, 241, 0.15)',
    badge: 'Security System Active'
  },
  {
    title: 'AI Intelligence Hub',
    description: 'Neural insights, automatic report drafting, and automated planning at your fingertips.',
    icon: BrainCircuit,
    color: 'from-emerald-400 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.15)',
    badge: 'Institutional Intelligence'
  },
  {
    title: 'Integrated Logistical Systems',
    description: 'Complete academic workflows, finance logs, dynamic course plans, and automated payroll.',
    icon: Activity,
    color: 'from-amber-400 to-pink-600',
    glow: 'rgba(245, 158, 11, 0.15)',
    badge: 'Telemetry Logs'
  }
];

export function AppGuideScreen({ onComplete }: AppGuideScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3 seconds total. Update progress every 30ms (100 updates total)
    const totalDuration = 3000;
    const intervalTime = 30;
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const nextProgress = prev + increment;
        
        // Update slide index based on progress
        const currentSlide = Math.min(
          Math.floor((nextProgress / 100) * onboardingSlides.length),
          onboardingSlides.length - 1
        );
        setActiveSlide(currentSlide);
        
        return nextProgress;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      onComplete();
    }
  }, [progress, onComplete]);

  const slide = onboardingSlides[activeSlide];
  const Icon = slide.icon;

  return (
    <div className="dashboard-shell fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950 font-body">
      {/* Dynamic Background Orbs */}
      <div 
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[160px] opacity-20 transition-all duration-700"
        style={{ backgroundColor: slide.glow.replace('0.15', '0.25') }}
      />
      <div 
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full blur-[160px] opacity-20 transition-all duration-700"
        style={{ backgroundColor: slide.glow.replace('0.15', '0.25') }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="glass-panel-light flex flex-col items-center border border-white/10 bg-slate-900/60 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl text-center space-y-8">
          
          {/* Top Info */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Axora Node Guide
              </span>
            </div>
            <button 
              onClick={onComplete}
              className="group flex items-center gap-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-300 hover:text-white transition-all"
            >
              Skip
              <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Icon Badge */}
          <div className="relative flex items-center justify-center h-28 w-28">
            {/* Outer animated rotating boundary */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-700/60 animate-spin [animation-duration:15s]" />
            
            {/* Soft inner glow */}
            <div 
              className="absolute inset-2 rounded-full blur-md opacity-40 transition-all duration-500" 
              style={{ backgroundColor: slide.glow.replace('0.15', '0.6') }}
            />
            
            {/* Main Icon Container */}
            <div className={cn(
              "relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl transition-all duration-500 transform hover:scale-105",
              slide.color
            )}>
              <Icon className="h-9 w-9 animate-float" />
            </div>
          </div>

          {/* Badge & Title */}
          <div className="space-y-3">
            <span className={cn(
              "inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-white/10 text-white bg-slate-800/80 transition-all duration-500"
            )}>
              {slide.badge}
            </span>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-white transition-all duration-500">
              {slide.title}
            </h2>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm mx-auto transition-all duration-500 h-12">
              {slide.description}
            </p>
          </div>

          {/* Page Indicators */}
          <div className="flex gap-2 justify-center w-full pt-2">
            {onboardingSlides.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  idx === activeSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
                )}
              />
            ))}
          </div>

          {/* Autoplay Progress Bar */}
          <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

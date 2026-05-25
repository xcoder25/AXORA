
'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { Loader2 } from 'lucide-react';

const { firebaseApp, firestore, auth } = initializeFirebase();

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
        </defs>
        
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
    }, 5000); 
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Literata:opsz,wght@7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          {booting ? (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#010206] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08)_0%,transparent_70%)] animate-pulse" />
              
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
          ) : children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

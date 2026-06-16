'use client';

import React, { useEffect, useState } from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function DesktopTitlebar() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Detect if running inside Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      setIsElectron(true);
    }
  }, []);

  if (!isElectron) {
    return null;
  }

  const handleMinimize = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.close();
    }
  };

  return (
    <div 
      className="w-full h-10 flex items-center justify-between px-4 select-none bg-background/95 border-b border-white/[0.05] text-foreground z-[9999] relative"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side: Logo and name */}
      <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#10b981]" />
        <span className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase font-headline">
          Axora <span className="text-accent">OS</span>
        </span>
      </div>

      {/* Right side: Native-like window controls */}
      <div 
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button 
          onClick={handleMinimize}
          className="h-10 w-12 flex items-center justify-center hover:bg-white/[0.05] transition-colors duration-200 group"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors duration-200" />
        </button>
        <button 
          onClick={handleMaximize}
          className="h-10 w-12 flex items-center justify-center hover:bg-white/[0.05] transition-colors duration-200 group"
          title="Maximize"
        >
          <Square className="w-3 h-3 text-white/60 group-hover:text-white transition-colors duration-200" />
        </button>
        <button 
          onClick={handleClose}
          className="h-10 w-12 flex items-center justify-center hover:bg-red-600 transition-colors duration-200 group"
          title="Close"
        >
          <X className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors duration-200" />
        </button>
      </div>
    </div>
  );
}

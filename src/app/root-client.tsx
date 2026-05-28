'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { AppSplashScreen } from '@/components/app-splash-screen';
import { AppGuideScreen } from '@/components/app-guide-screen';

const { firebaseApp, firestore, auth } = initializeFirebase();

const SPLASH_MIN_MS = 2200;

export default function RootClient({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
      // Check if the onboarding guide has been seen yet
      const guideSeen = localStorage.getItem('axora-guide-seen');
      if (!guideSeen) {
        setShowGuide(true);
      }
    }, SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('axora-theme') || 'dark';
    document.body.classList.remove('theme-light', 'theme-cyberpunk', 'theme-solarized');
    if (savedTheme !== 'dark') {
      document.body.classList.add(`theme-${savedTheme}`);
    }
  }, []);

  return (
    <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {booting ? (
        <AppSplashScreen status="Starting Axora OS" />
      ) : showGuide ? (
        <AppGuideScreen
          onComplete={() => {
            localStorage.setItem('axora-guide-seen', 'true');
            setShowGuide(false);
          }}
        />
      ) : (
        children
      )}
    </FirebaseClientProvider>
  );
}



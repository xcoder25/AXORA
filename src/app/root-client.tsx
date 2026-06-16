'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { AppSplashScreen } from '@/components/app-splash-screen';
import { AppGuideScreen } from '@/components/app-guide-screen';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const SPLASH_MIN_MS = 2200;

export default function RootClient({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [firebaseInstance] = useState(() => initializeFirebase());
  const { firebaseApp, firestore, auth } = firebaseInstance;

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
      const guideSeen = localStorage.getItem('axora-guide-seen');
      if (!guideSeen) setShowGuide(true);
    }, SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
        <FirebaseErrorListener />
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
    </ThemeProvider>
  );
}

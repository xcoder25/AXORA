'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { AppSplashScreen } from '@/components/app-splash-screen';

const { firebaseApp, firestore, auth } = initializeFirebase();

const SPLASH_MIN_MS = 2200;

export default function RootClient({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {booting ? <AppSplashScreen status="Starting Axora OS" /> : children}
    </FirebaseClientProvider>
  );
}


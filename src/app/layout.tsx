
'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { AppSplashScreen } from '@/components/app-splash-screen';

const { firebaseApp, firestore, auth } = initializeFirebase();

const SPLASH_MIN_MS = 2200;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), SPLASH_MIN_MS);
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
            <AppSplashScreen status="Starting Axora OS" />
          ) : (
            children
          )}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

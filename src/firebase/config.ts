const PLACEHOLDER_API_KEY = 'placeholder-api-key';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDQlEbCpA-5bDkWaYNvYNTEOA8AxAV_3Bw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mooneychat.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mooneychat',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mooneychat.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1080124565345',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1080124565345:web:953202a78769dcb9580720',
};

/** True when real Firebase web app credentials are loaded from .env.local or hardcoded */
export function isFirebaseConfigured(): boolean {
  return firebaseConfig.apiKey !== PLACEHOLDER_API_KEY;
}

export const FIREBASE_SETUP_MESSAGE =
  'Firebase is not configured. Create .env.local in the project root (see .env.example), add your Web app config from Firebase Console → Project settings → Your apps, then restart the dev server.';

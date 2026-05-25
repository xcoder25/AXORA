const PLACEHOLDER_API_KEY = 'placeholder-api-key';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || PLACEHOLDER_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'placeholder-messaging-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder-app-id',
};

/** True when real Firebase web app credentials are loaded from .env.local */
export function isFirebaseConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return Boolean(apiKey && apiKey !== PLACEHOLDER_API_KEY);
}

export const FIREBASE_SETUP_MESSAGE =
  'Firebase is not configured. Create .env.local in the project root (see .env.example), add your Web app config from Firebase Console → Project settings → Your apps, then restart the dev server.';

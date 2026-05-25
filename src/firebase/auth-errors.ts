const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied':
    'Firestore blocked this request. Deploy security rules: open Firebase Console → Firestore → Rules, paste the contents of firestore.rules from this project, and click Publish. Or run: firebase deploy --only firestore:rules',
  'auth/configuration-not-found':
    'Email/Password sign-in is not enabled. In Firebase Console open project "mooneychat" → Authentication → Get started (if needed) → Sign-in method → Email/Password → Enable → Save, then try again.',
  'auth/operation-not-allowed':
    'This sign-in method is disabled. Enable Email/Password under Authentication → Sign-in method in Firebase Console.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Invalid Firebase API key. Check .env.local matches your Firebase web app config and restart the dev server.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
};

export function getFirebaseAuthErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };
  if (err?.code && AUTH_ERROR_MESSAGES[err.code]) {
    return AUTH_ERROR_MESSAGES[err.code];
  }
  return err?.message ?? 'Authentication failed. Please try again.';
}

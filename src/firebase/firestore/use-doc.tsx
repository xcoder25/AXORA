'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirestore, useAuth } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc(path: string | null) {
  const db = useFirestore();
  const auth = useAuth();
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState<Error | null>(null);

  // Wait for Auth token before Firestore reads (avoids permission-denied race on dashboard load)
  useEffect(() => {
    if (!auth) {
      setAuthReady(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.getIdToken();
        setAuthReady(true);
      } else {
        setAuthReady(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!authReady) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);
    const docRef = doc(db, path);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.data() || null);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path, authReady]);

  return { data, loading, error };
}

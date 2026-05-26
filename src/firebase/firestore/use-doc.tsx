'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { useFirestore, useAuth } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

function isPermissionDenied(err: unknown): boolean {
  return (
    (err as FirestoreError)?.code === 'permission-denied' ||
    (err as { code?: string })?.code === 'permission-denied'
  );
}

export function useDoc(path: string | null) {
  const db = useFirestore();
  const auth = useAuth();
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!auth) {
      setLoading(true);
      return;
    }

    let cancelled = false;
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeSnapshot?.();
      unsubscribeSnapshot = undefined;

      if (cancelled) return;

      if (!user) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
      }

      const usersMatch = path.match(/^users\/([^/]+)$/);
      if (usersMatch && usersMatch[1] !== user.uid) {
        setLoading(false);
        setError(new Error('Cannot read another user profile.'));
        return;
      }

      setLoading(true);
      setError(null);

      void user.getIdToken().then(() => {
        if (cancelled) return;

        const docRef = doc(db, path);
        unsubscribeSnapshot = onSnapshot(
          docRef,
          (snapshot) => {
            if (cancelled) return;
            setData(snapshot.data() ?? null);
            setLoading(false);
            setError(null);
          },
          (err) => {
            if (cancelled) return;
            console.error('Firestore snapshot error:', err);
            if (!isPermissionDenied(err)) {
              setError(err instanceof Error ? err : new Error(String(err)));
              setLoading(false);
              return;
            }
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            setError(permissionError);
            setLoading(false);
          }
        );
      });
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      unsubscribeSnapshot?.();
    };
  }, [db, path, auth]);

  return { data, loading, error };
}

'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, DocumentData, Query, FirestoreError } from 'firebase/firestore';
import { useAuth } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

function isPermissionDenied(err: unknown): boolean {
  return (
    (err as FirestoreError)?.code === 'permission-denied' ||
    (err as { code?: string })?.code === 'permission-denied'
  );
}

function isIndexRequired(err: unknown): boolean {
  const code = (err as FirestoreError)?.code;
  return code === 'failed-precondition' || code === 'unimplemented';
}

function extractIndexUrl(err: unknown): string | null {
  const message = (err as Error)?.message ?? '';
  const match = message.match(/https:\/\/console\.firebase\.google\.com[^\s)]+/);
  return match?.[0] ?? null;
}

export function useCollection(query: Query | null) {
  const auth = useAuth();
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(!!query);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
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
        setData([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      void user.getIdToken().then(() => {
        if (cancelled) return;

        unsubscribeSnapshot = onSnapshot(
          query,
          (snapshot) => {
            if (cancelled) return;
            setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
            setError(null);
          },
          (err) => {
            if (cancelled) return;
            console.error('Firestore collection snapshot error:', err);
            if (isIndexRequired(err)) {
              const indexUrl = extractIndexUrl(err);
              const indexError = new Error(
                indexUrl
                  ? `Firestore index required. Create it: ${indexUrl}`
                  : 'Firestore index required. Run: npm run firebase:deploy:indexes'
              );
              setError(indexError);
              setLoading(false);
              return;
            }
            if (!isPermissionDenied(err)) {
              setError(err instanceof Error ? err : new Error(String(err)));
              setLoading(false);
              return;
            }
            const permissionError = new FirestorePermissionError({
              path: 'collection_query',
              operation: 'list',
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
  }, [query, auth]);

  return { data, loading, error };
}

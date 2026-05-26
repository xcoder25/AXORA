'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export const FirebaseErrorListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: { context?: { path?: string } }) => {
      const path = error?.context?.path ?? '';
      const isCollectionList = path === 'collection_query';
      toast({
        variant: 'destructive',
        title: 'Firestore rules blocked this',
        description: isCollectionList
          ? 'Republish FIRESTORE-RULES-PASTE.txt (admins/teachers can list users in their school). Sign in as admin, then refresh.'
          : 'Open Firebase Console → mooneychat → Firestore → Rules, paste FIRESTORE-RULES-PASTE.txt, click Publish.',
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Firebase Permission Error:', error);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
};

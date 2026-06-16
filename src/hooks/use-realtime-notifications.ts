'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, limit, onSnapshot,
  updateDoc, doc, deleteDoc, Timestamp
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type RealtimeNotification = {
  id: string;
  type: 'security' | 'finance' | 'identity' | 'exam' | 'ai' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  time: string;
  read: boolean;
};

function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function useRealtimeNotifications(schoolId?: string) {
  const db = useFirestore();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastNotif, setToastNotif] = useState<RealtimeNotification | null>(null);
  const isFirstLoad = useRef(true);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!db || !schoolId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'schools', schoolId, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(30)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: RealtimeNotification[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const ts = data.timestamp instanceof Timestamp
          ? data.timestamp.toDate()
          : new Date();
        return {
          id: docSnap.id,
          type: data.type || 'info',
          title: data.title || '',
          message: data.message || '',
          timestamp: ts,
          time: formatRelativeTime(ts),
          read: data.read ?? false,
        };
      });

      // Show toast for new items (not first load)
      if (!isFirstLoad.current && items.length > prevCountRef.current) {
        const newest = items.find(n => !n.read);
        if (newest) {
          setToastNotif(newest);
          setTimeout(() => setToastNotif(null), 5000);
        }
      }

      prevCountRef.current = items.length;
      isFirstLoad.current = false;
      setNotifications(items);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [db, schoolId]);

  // Update time strings every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev =>
        prev.map(n => ({ ...n, time: formatRelativeTime(n.timestamp) }))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    if (db && schoolId) {
      try {
        await updateDoc(
          doc(db, 'schools', schoolId, 'notifications', id),
          { read: true }
        );
      } catch { /* silently fail */ }
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (db && schoolId) {
      const unread = notifications.filter(n => !n.read);
      await Promise.allSettled(
        unread.map(n =>
          updateDoc(doc(db, 'schools', schoolId, 'notifications', n.id), { read: true })
        )
      );
    }
  };

  const dismiss = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (db && schoolId) {
      try {
        await deleteDoc(doc(db, 'schools', schoolId, 'notifications', id));
      } catch { /* silently fail */ }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    toastNotif,
    markRead,
    markAllRead,
    dismiss,
  };
}

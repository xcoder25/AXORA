'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, Timestamp, where
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type ActivityEvent = {
  id: string;
  type: 'identity' | 'finance' | 'security' | 'exam' | 'admin' | 'ai';
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  node?: string;
  isNew?: boolean;
};

const DEMO_EVENTS = [
  {
    type: 'identity' as const,
    title: 'Neural Scan — Main Gate',
    description: '{n} students identified • {c}% avg confidence',
    node: 'Main Gate',
  },
  {
    type: 'finance' as const,
    title: 'Payment Cleared',
    description: 'STU-{id} • ₦{amount} via Paystack',
    node: 'Finance Node',
  },
  {
    type: 'security' as const,
    title: 'Unknown Identity Alert',
    description: 'Node {cam} flagged unverified individual',
    node: 'Security',
  },
  {
    type: 'identity' as const,
    title: 'QR Pass Verified',
    description: 'Student cleared via digital pass at {gate}',
    node: 'Library',
  },
  {
    type: 'exam' as const,
    title: 'Exam Session Live',
    description: '{subject} exam active — {n} students in session',
    node: 'CBT Engine',
  },
  {
    type: 'ai' as const,
    title: 'AXIOM Analysis Ready',
    description: 'Institutional intelligence report generated for review',
    node: 'NEXORA',
  },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDemoEvent() {
  const template = DEMO_EVENTS[Math.floor(Math.random() * DEMO_EVENTS.length)];
  const desc = template.description
    .replace('{n}', String(randomBetween(12, 48)))
    .replace('{c}', String(randomBetween(88, 98)))
    .replace('{id}', String(randomBetween(1000, 9999)))
    .replace('{amount}', String(randomBetween(5, 25) * 1000))
    .replace('{cam}', `0${randomBetween(1, 9)}`)
    .replace('{gate}', 'Block B Entrance')
    .replace('{subject}', ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'][Math.floor(Math.random() * 5)])
    .replace('{n}', String(randomBetween(20, 55)));

  return {
    type: template.type,
    title: template.title,
    description: desc,
    node: template.node,
    timestamp: serverTimestamp(),
  };
}

function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function useRealtimeActivity(schoolId?: string) {
  const db = useFirestore();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEventId, setNewEventId] = useState<string | null>(null);
  const injectorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);
  const prevCountRef = useRef(0);

  // Subscribe to Firestore activity feed
  useEffect(() => {
    if (!db || !schoolId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'schools', schoolId, 'activityFeed'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: ActivityEvent[] = snap.docs.map((doc) => {
        const data = doc.data();
        const ts = data.timestamp instanceof Timestamp
          ? data.timestamp.toDate()
          : new Date();
        return {
          id: doc.id,
          type: data.type || 'info',
          title: data.title || '',
          description: data.description || '',
          node: data.node,
          time: formatRelativeTime(ts),
          timestamp: ts,
        };
      });

      // Detect new items (not on first load)
      if (!isFirstLoad.current && items.length > prevCountRef.current) {
        const newest = items[0];
        if (newest) {
          setNewEventId(newest.id);
          setTimeout(() => setNewEventId(null), 3000);
        }
      }

      prevCountRef.current = items.length;
      isFirstLoad.current = false;
      setEvents(items);
      setLoading(false);
    }, (err) => {
      console.warn('Activity feed error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [db, schoolId]);

  // Demo event injector — fires every 12–20 seconds
  useEffect(() => {
    if (!db || !schoolId) return;

    const scheduleNext = () => {
      const delay = randomBetween(12000, 20000);
      injectorRef.current = setTimeout(async () => {
        try {
          await addDoc(
            collection(db, 'schools', schoolId, 'activityFeed'),
            generateDemoEvent()
          );
        } catch (e) {
          // silently fail if permissions aren't set up yet
        }
        scheduleNext();
      }, delay);
    };

    // Small initial delay before first injection
    injectorRef.current = setTimeout(scheduleNext, 5000);

    return () => {
      if (injectorRef.current) clearTimeout(injectorRef.current);
    };
  }, [db, schoolId]);

  return { events, loading, newEventId };
}

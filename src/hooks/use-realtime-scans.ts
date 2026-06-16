'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type AttendanceScan = {
  id: string;
  student: string;
  grade: string;
  method: 'Face ID' | 'QR Pass';
  node: string;
  status: 'granted' | 'denied';
  confidence?: number;
  timestamp: Date;
  time: string;
  isNew?: boolean;
};

export type CameraNode = {
  id: string;
  name: string;
  status: 'active' | 'offline';
  detections: number;
  zone: string;
};

const DEMO_STUDENTS = [
  { name: 'Alice Johnson', grade: 'JSS-3A' },
  { name: 'Brian Okafor', grade: 'SSS-1B' },
  { name: 'Chioma Nweke', grade: 'SSS-3A' },
  { name: 'David Adeyemi', grade: 'JSS-2C' },
  { name: 'Esther Balogun', grade: 'SSS-2A' },
  { name: 'Felix Eze', grade: 'JSS-1A' },
  { name: 'Grace Okonkwo', grade: 'SSS-3B' },
  { name: 'Henry Abubakar', grade: 'JSS-3B' },
  { name: 'Ifeoma Obiora', grade: 'SSS-1A' },
  { name: 'John Amara', grade: 'SSS-2B' },
];

const NODES = ['Main Gate', 'Library', 'Science Block', 'Cafeteria', 'Admin Block'];

function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function generateScanEvent() {
  const isDenied = Math.random() < 0.12; // 12% chance denied
  const isQr = Math.random() < 0.35;
  const student = isDenied
    ? { name: 'Unknown Individual', grade: 'N/A' }
    : DEMO_STUDENTS[Math.floor(Math.random() * DEMO_STUDENTS.length)];

  return {
    student: student.name,
    grade: student.grade,
    method: isQr ? 'QR Pass' : 'Face ID',
    node: NODES[Math.floor(Math.random() * NODES.length)],
    status: isDenied ? 'denied' : 'granted',
    confidence: isDenied ? undefined : 88 + Math.floor(Math.random() * 12),
    timestamp: serverTimestamp(),
  };
}

export function useRealtimeScans(schoolId?: string) {
  const db = useFirestore();
  const [scans, setScans] = useState<AttendanceScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestScan, setLatestScan] = useState<AttendanceScan | null>(null);
  const injectorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!db || !schoolId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'schools', schoolId, 'attendanceScans'),
      orderBy('timestamp', 'desc'),
      limit(25)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: AttendanceScan[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const ts = data.timestamp instanceof Timestamp
          ? data.timestamp.toDate()
          : new Date();
        return {
          id: docSnap.id,
          student: data.student || 'Unknown',
          grade: data.grade || 'N/A',
          method: data.method || 'Face ID',
          node: data.node || 'Unknown Node',
          status: data.status || 'granted',
          confidence: data.confidence,
          timestamp: ts,
          time: formatRelativeTime(ts),
          isNew: false,
        };
      });

      if (!isFirstLoad.current && items.length > prevCountRef.current) {
        const newest = { ...items[0], isNew: true };
        setLatestScan(newest);
        setTimeout(() => setLatestScan(null), 4000);
      }

      prevCountRef.current = items.length;
      isFirstLoad.current = false;
      setScans(items);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [db, schoolId]);

  // Demo scan injector — fires every 8–16 seconds
  useEffect(() => {
    if (!db || !schoolId) return;

    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 8000;
      injectorRef.current = setTimeout(async () => {
        try {
          await addDoc(
            collection(db, 'schools', schoolId, 'attendanceScans'),
            generateScanEvent()
          );
        } catch {
          // silently fail
        }
        scheduleNext();
      }, delay);
    };

    injectorRef.current = setTimeout(scheduleNext, 3000);
    return () => {
      if (injectorRef.current) clearTimeout(injectorRef.current);
    };
  }, [db, schoolId]);

  // Compute stats from scans
  const stats = {
    present: scans.filter(s => s.status === 'granted').length,
    denied: scans.filter(s => s.status === 'denied').length,
    faceId: scans.filter(s => s.method === 'Face ID').length,
    qrPass: scans.filter(s => s.method === 'QR Pass').length,
    avgConfidence: scans.length > 0
      ? Math.round(
          scans
            .filter(s => s.confidence !== undefined)
            .reduce((acc, s) => acc + (s.confidence ?? 0), 0) /
          Math.max(1, scans.filter(s => s.confidence !== undefined).length)
        )
      : 0,
  };

  return { scans, loading, latestScan, stats };
}

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  doc, onSnapshot, setDoc, getDoc, Timestamp
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type KpiData = {
  attendance: number;
  feeCollection: number;
  examPassRate: number;
  securityIndex: number;
  studentsOnCampus: number;
  activeNodes: number;
  lastUpdated: Date | null;
};

const DEFAULT_KPIS: KpiData = {
  attendance: 94,
  feeCollection: 87,
  examPassRate: 88,
  securityIndex: 98,
  studentsOnCampus: 1172,
  activeNodes: 3,
  lastUpdated: null,
};

function randomVariation(base: number, range: number = 2): number {
  const delta = (Math.random() * range * 2) - range;
  return Math.min(100, Math.max(0, Math.round(base + delta)));
}

export function useRealtimeKpis(schoolId?: string) {
  const db = useFirestore();
  const [kpis, setKpis] = useState<KpiData>(DEFAULT_KPIS);
  const [loading, setLoading] = useState(true);
  const [changed, setChanged] = useState<Partial<Record<keyof KpiData, boolean>>>({});
  const prevKpisRef = useRef<KpiData>(DEFAULT_KPIS);
  const simulatorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!db || !schoolId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'schools', schoolId, 'meta', 'kpiMatrix');

    // Seed default data if document doesn't exist
    const seedIfMissing = async () => {
      try {
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            ...DEFAULT_KPIS,
            lastUpdated: Timestamp.now(),
          });
        }
      } catch {
        // silently fail
      }
    };
    void seedIfMissing();

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const newKpis: KpiData = {
          attendance: data.attendance ?? DEFAULT_KPIS.attendance,
          feeCollection: data.feeCollection ?? DEFAULT_KPIS.feeCollection,
          examPassRate: data.examPassRate ?? DEFAULT_KPIS.examPassRate,
          securityIndex: data.securityIndex ?? DEFAULT_KPIS.securityIndex,
          studentsOnCampus: data.studentsOnCampus ?? DEFAULT_KPIS.studentsOnCampus,
          activeNodes: data.activeNodes ?? DEFAULT_KPIS.activeNodes,
          lastUpdated: data.lastUpdated instanceof Timestamp
            ? data.lastUpdated.toDate()
            : null,
        };

        // Detect which fields changed
        const diff: Partial<Record<keyof KpiData, boolean>> = {};
        (Object.keys(newKpis) as (keyof KpiData)[]).forEach((key) => {
          if (key !== 'lastUpdated' && newKpis[key] !== prevKpisRef.current[key]) {
            diff[key] = true;
          }
        });

        prevKpisRef.current = newKpis;
        setKpis(newKpis);
        setChanged(diff);
        setLoading(false);

        // Clear changed flags after animation
        if (Object.keys(diff).length > 0) {
          setTimeout(() => setChanged({}), 2000);
        }
      } else {
        setLoading(false);
      }
    }, () => {
      setLoading(false);
    });

    return () => unsub();
  }, [db, schoolId]);

  // Live KPI drift simulator — subtle fluctuations every 15-25 seconds
  useEffect(() => {
    if (!db || !schoolId) return;

    const docRef = doc(db, 'schools', schoolId, 'meta', 'kpiMatrix');

    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 10000;
      simulatorRef.current = setTimeout(async () => {
        try {
          const current = prevKpisRef.current;
          await setDoc(docRef, {
            attendance: randomVariation(current.attendance, 1.5),
            feeCollection: randomVariation(current.feeCollection, 0.8),
            examPassRate: randomVariation(current.examPassRate, 1),
            securityIndex: randomVariation(current.securityIndex, 0.5),
            studentsOnCampus: Math.max(800,
              current.studentsOnCampus + Math.floor((Math.random() - 0.5) * 20)
            ),
            activeNodes: current.activeNodes,
            lastUpdated: Timestamp.now(),
          }, { merge: true });
        } catch {
          // silently fail
        }
        scheduleNext();
      }, delay);
    };

    // Initial delay
    simulatorRef.current = setTimeout(scheduleNext, 8000);
    return () => {
      if (simulatorRef.current) clearTimeout(simulatorRef.current);
    };
  }, [db, schoolId]);

  return { kpis, loading, changed };
}

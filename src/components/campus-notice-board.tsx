'use client';

import { useMemo, useState } from 'react';
import { useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { formatRelativeTime } from '@/lib/format-time';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CampusNoticeBoard({ schoolId, compact }: { schoolId?: string; compact?: boolean }) {
  const db = useFirestore();
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const announcementsQuery = useMemoFirebase(() => {
    if (!db || !schoolId) return null;
    return query(
      collection(db, 'announcements'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc'),
      limit(compact ? 5 : 12)
    );
  }, [db, schoolId, compact]);

  const { data: announcements, loading } = useCollection(announcementsQuery);

  const visible = useMemo(() => {
    if (!announcements) return [];
    const role = profile?.role as string | undefined;
    return announcements.filter((a: { targetRole?: string }) => {
      const target = (a.targetRole || 'All').toLowerCase();
      if (target.includes('all')) return true;
      if (!role) return true;
      if (target.includes('student') && role === 'student') return true;
      if (target.includes('teacher') && role === 'teacher') return true;
      if (target.includes('parent') && role === 'parent') return true;
      if (target.includes('admin') && role === 'admin') return true;
      return target.includes('all roles');
    });
  }, [announcements, profile?.role]);

  return (
    <Card className="glass-card-light border-none overflow-hidden shadow-none lg:col-span-3">
      <CardHeader className="border-b border-indigo-50 pb-4 bg-gradient-to-r from-indigo-50/80 to-violet-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-indigo-md">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-headline text-xl text-slate-900">Campus Notice Board</CardTitle>
              <CardDescription className="text-xs">Live announcements from your institution</CardDescription>
            </div>
          </div>
          <Bell className="h-4 w-4 text-indigo-500 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 max-h-[420px] overflow-y-auto md:[&::-webkit-scrollbar]:hidden md:[scrollbar-width:none]">
        {loading && (
          <p className="text-center text-sm text-muted-foreground py-8 animate-pulse">Syncing notices…</p>
        )}
        {!loading && visible.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-12">No announcements yet.</p>
        )}
        {visible.map((ann: Record<string, unknown>) => {
          const id = ann.id as string;
          const isOpen = expandedId === id;
          const createdAt =
            (ann.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ||
            (ann.createdAt as string);

          return (
            <div
              key={id}
              className={cn(
                'rounded-2xl border transition-all duration-300',
                isOpen
                  ? 'border-indigo-200 bg-white shadow-md'
                  : 'border-indigo-100/80 bg-indigo-50/30 hover:bg-white hover:border-indigo-200'
              )}
            >
              <button
                type="button"
                className="w-full text-left p-4 flex items-start justify-between gap-3"
                onClick={() => setExpandedId(isOpen ? null : id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[8px] font-bold uppercase border-indigo-200 text-indigo-600"
                    >
                      {(ann.targetRole as string) || 'All'}
                    </Badge>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">
                      {formatRelativeTime(createdAt)}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-900 line-clamp-1">{ann.title as string}</p>
                  {!isOpen && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ann.content as string}</p>
                  )}
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-indigo-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ann.content as string}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-3 font-medium">
                    — {(ann.sender as string) || 'Administration'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
      {compact && (
        <CardFooter className="border-t border-indigo-50 p-3">
          <Button variant="ghost" className="w-full text-[9px] font-bold uppercase text-indigo-600" asChild>
            <Link href="/dashboard/communication">View all broadcasts</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

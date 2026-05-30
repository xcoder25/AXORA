'use client';

import { useState } from 'react';
import { useUser, useDoc } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
  Activity,
  Loader2,
  ChevronRight,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askAxoraAdmin } from '@/ai/flows/axora-institutional-intelligence';
import { formatRoleLabel, isAdminRole } from '@/lib/roles';
import { CampusNoticeBoard } from '@/components/campus-notice-board';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';

export default function DashboardPage() {
  const { user } = useUser();
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null);
  const [adminQuery, setAdminQuery] = useState('');
  const [axoraResponse, setAxoraResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = isAdminRole(profile?.role);
  const firstName = profile?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const stats = [
    { title: 'Identity Hub', value: 'Syncing', icon: Eye, color: 'text-indigo-600', trend: 'Deep Vision Active' },
    { title: 'Courses', value: '12', icon: BookOpen, color: 'text-indigo-500', trend: '16 Modules' },
    { title: 'Institutional Load', value: 'Low', icon: Activity, color: 'text-emerald-600', trend: 'Node Stability 100%' },
    { title: 'Risk Index', value: '0.02', icon: ShieldCheck, color: 'text-violet-600', trend: 'Secure Node' },
  ];

  async function handleAxoraCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!adminQuery) return;
    setLoading(true);
    startAxoraLoading('Running institutional intelligence…');
    try {
      const result = await askAxoraAdmin({
        query: adminQuery,
        schoolContext: {
          studentCount: 1284,
          teacherCount: 48,
          revenueCollectionRate: 96,
          averageAttendance: 94,
          riskIndex: 0.02,
        },
      });
      setAxoraResponse(result);
      setAdminQuery('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      stopAxoraLoading();
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2 animate-in fade-in slide-in-from-left-3 duration-700">
          <div className="flex items-center gap-2">
            <Badge className="h-5 border-indigo-200 bg-indigo-50 font-bold uppercase tracking-widest text-[9px] text-indigo-700">
              {formatRoleLabel(profile?.role)} Portal
            </Badge>
            <Sparkles className="h-4 w-4 animate-pulse text-indigo-500" />
          </div>
          <h2 className="font-headline text-4xl font-bold tracking-tight text-slate-900">
            Welcome, <span className="text-indigo-glow text-indigo-600">{firstName}</span>
          </h2>
          <p className="max-w-xl text-base font-medium text-slate-500">
            Axora has synchronized your academic and security telemetry.
          </p>
        </div>
        <div className="glass-panel-light flex animate-in fade-in slide-in-from-right-3 items-center gap-4 p-4 duration-700 delay-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-lg font-bold text-white shadow-indigo-md">
            {profile?.displayName?.[0] || 'A'}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {formatRoleLabel(profile?.role)}
            </p>
            <p className="font-mono text-[10px] text-indigo-500/80">NODE_{user?.uid.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-indigo-lg animate-in fade-in zoom-in-95 duration-700">
          <CardHeader className="relative z-10 pb-4">
            <div className="mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4 animate-pulse text-indigo-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-100">
                Admin Intelligence Hub
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">How can I assist the institution today?</CardTitle>
            <CardDescription className="text-indigo-100">
              Analyze performance, generate reports, or plan campus-wide actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pb-6">
            <form onSubmit={handleAxoraCommand} className="flex gap-2">
              <Input
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
                placeholder="e.g. Analyze revenue trends and draft a parent memo"
                className="h-12 rounded-xl border-white/20 bg-white/15 text-white placeholder:text-white/50 focus:ring-white/30"
              />
              <Button
                type="submit"
                className="h-12 rounded-xl bg-white px-6 font-bold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Run
                  </>
                )}
              </Button>
            </form>
            {axoraResponse && (
              <div className="mt-6 animate-in zoom-in-95 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl duration-500">
                <Badge className="mb-4 border-white/30 bg-white/20 text-[9px] font-black uppercase text-white">
                  {axoraResponse.verdict} STATUS
                </Badge>
                <p className="mb-6 text-sm italic leading-relaxed text-white/95">
                  &ldquo;{axoraResponse.analysis}&rdquo;
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    {axoraResponse.recommendations?.map((rec: string, i: number) => (
                      <p key={i} className="flex gap-2 text-xs text-indigo-100">
                        <span className="font-bold text-white">•</span> {rec}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {axoraResponse.suggestedActions?.map((action: any, i: number) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="h-8 border-white/20 bg-white/10 text-[9px] font-bold uppercase text-white hover:bg-white/25"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.title}
            className="glass-card-light animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
            </CardHeader>
            <CardContent>
              <div className="mb-1 text-2xl font-bold tracking-tight text-slate-900">{stat.value}</div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <div className="lg:col-span-7">
          <CampusNoticeBoard schoolId={profile?.schoolId as string | undefined} compact />
        </div>

        <Card className="glass-card-light border-none lg:col-span-4 shadow-none">
          <CardHeader className="border-b border-indigo-50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-xl text-slate-900">Neural Integrity Stream</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                  Deep vision identification logs
                </CardDescription>
              </div>
              <Activity className="h-4 w-4 animate-pulse text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="group flex items-center gap-4 rounded-2xl border border-indigo-50 bg-indigo-50/30 p-4 transition-all duration-300 hover:border-indigo-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white">
                    <Eye className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-800">
                      Identity Match: Node 0{i}
                    </p>
                    <p className="text-[11px] font-medium leading-relaxed text-slate-500">
                      Verified {i % 2 === 0 ? 'Faculty' : 'Student'} recognition — registry updated.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t border-indigo-50 p-4">
            <Button
              variant="ghost"
              className="w-full text-[9px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50"
            >
              View Full Identity Matrix <ChevronRight className="ml-2 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <Card className="glass-card-light border-none shadow-none">
            <CardHeader className="border-b border-indigo-50 pb-4">
              <CardTitle className="font-headline text-xl text-slate-900">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
              {[
                { title: 'Neural Identity', icon: Eye, href: '/dashboard/attendance' },
                { title: 'Security Matrix', icon: ShieldCheck, href: '/dashboard/security' },
                { title: 'Strategic Resources', icon: Sparkles, href: '/dashboard/resources' },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="group flex w-full items-center justify-between rounded-2xl border border-indigo-100 bg-white/80 p-4 transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-600 hover:shadow-indigo-md"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-indigo-600 transition-colors group-hover:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 transition-colors group-hover:text-white">
                      {action.title}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 -translate-x-2 text-indigo-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-lg transition-transform duration-500 hover:scale-[1.01]">
            <CardContent className="p-8">
              <Sparkles className="mb-4 h-8 w-8 text-white animate-float" />
              <h3 className="mb-2 text-2xl font-bold leading-tight text-white">Nexora Enterprise</h3>
              <p className="mb-6 text-xs font-medium text-indigo-100">
                Dedicated neural clusters and priority deep vision nodes.
              </p>
              <Button className="h-11 w-full rounded-xl bg-white text-xs font-bold text-indigo-700 shadow-lg hover:bg-indigo-50">
                Upgrade Infrastructure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

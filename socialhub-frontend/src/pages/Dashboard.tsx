import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  isValid,
} from 'date-fns';
import { usePostStore, type Post } from '@/stores/postStore';
import { useAccountStore } from '@/stores/accountStore';
import { useBillingStore } from '@/stores/billingStore';
import axiosInstance from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Sparkles,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Zap,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStats {
  total_posts: number;
  scheduled_posts: number;
  published_posts: number;
  partial_posts: number;
  failed_posts: number;
  detailed_status?: Record<string, number>;
  connected_accounts: number;
}

const getPostDate = (p: Post): Date | null => {
  const raw = p.scheduled_time || p.published_at || p.created_at;
  if (!raw) return null;
  try {
    const d = parseISO(raw);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

const Dashboard = () => {
  const { posts, scheduledPosts, fetchPosts, fetchScheduledPosts } = usePostStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { usage, subscription, fetchUsage, fetchSubscription } = useBillingStore();
  const [backendStats, setBackendStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchPosts().catch(() => {});
    fetchScheduledPosts().catch(() => {});
    fetchAccounts().catch(() => {});
    fetchUsage().catch(() => {});
    fetchSubscription().catch(() => {});
    axiosInstance.get('/dashboard/').then(({ data }) => setBackendStats(data)).catch(() => {});
  }, [fetchPosts, fetchScheduledPosts, fetchAccounts, fetchUsage, fetchSubscription]);

  const totalPosts = backendStats?.total_posts ?? posts.length;
  const publishedCount = backendStats?.published_posts ?? posts.filter((p) => p.status === 'published' || p.status === 'posted').length;
  const scheduledCount = backendStats?.scheduled_posts ?? posts.filter((p) => p.status === 'scheduled').length;
  const failedCount = backendStats?.failed_posts ?? posts.filter((p) => p.status === 'failed').length;
  const connectedCount = backendStats?.connected_accounts ?? accounts.filter((a) => a.connected).length;

  const creditsRemaining = Number(usage?.credits_remaining ?? 0);
  const creditsTotal = Number(usage?.credits_total ?? 0);
  const creditsPct = creditsTotal > 0 ? Math.round((creditsRemaining / creditsTotal) * 100) : 0;
  const planName = subscription?.plan?.name || subscription?.plan_name || 'Free plan';

  // Determine whether the subscription is currently active. Mirrors logic
  // used in the billing view so the dashboard label matches the plans UX.
  const isActive =
    Boolean(subscription?.is_active) ||
    subscription?.status === 'active' ||
    subscription?.status === 'trialing' ||
    subscription?.status === 'pending';
  const isCancelled =
    Boolean(subscription?.cancelled_at) ||
    subscription?.status === 'cancelled' ||
    subscription?.status === 'canceled';

  const stats = [
    { label: 'Total Posts', value: totalPosts, icon: Calendar, gradient: 'from-blue-600 to-blue-500' },
    { label: 'Published', value: publishedCount, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Scheduled', value: scheduledCount, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Failed', value: failedCount, icon: XCircle, gradient: 'from-rose-500 to-red-500' },
    { label: 'Connected Accounts', value: connectedCount, icon: Users, gradient: 'from-blue-500 to-blue-400' },
  ];

  // Mini calendar state
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const allPosts = useMemo(() => {
    const map = new Map<number, Post>();
    scheduledPosts.forEach((p) => map.set(p.id, p));
    posts.forEach((p) => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [posts, scheduledPosts]);

  const postsByDay = useMemo(() => {
    const byDay = new Map<string, Post[]>();
    allPosts.forEach((p) => {
      const d = getPostDate(p);
      if (!d) return;
      const key = format(d, 'yyyy-MM-dd');
      const existing = byDay.get(key) || [];
      existing.push(p);
      byDay.set(key, existing);
    });
    return byDay;
  }, [allPosts]);

  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  // Upcoming scheduled list (next 5)
  const upcoming = useMemo(() => {
    const now = new Date();
    return allPosts
      .filter((p) => p.status === 'scheduled' || p.status === 'queued')
      .map((p) => ({ p, d: getPostDate(p) }))
      .filter((x) => x.d && x.d >= now)
      .sort((a, b) => (a.d!.getTime() - b.d!.getTime()))
      .slice(0, 5);
  }, [allPosts]);

  return (
    <div className="max-w-6xl mx-auto animate-slide-up space-y-4">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-blue-600 to-blue-400 p-5 sm:p-6 text-white shadow-xl shadow-blue-500/30">
        <div className="absolute -top-20 -left-10 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
              <Sparkles className="w-3 h-3" />
              Overview
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Welcome back.
            </h2>
            <p className="mt-1 text-white/80 text-sm max-w-xl">
              A quick snapshot of your posts, schedule, and accounts.
            </p>
          </div>
          <Button
            asChild
            className="bg-white text-blue-700 hover:bg-white/90 rounded-full px-4 sm:px-5 h-10 sm:h-11 shadow-lg font-semibold text-sm"
          >
            <Link to="/dashboard/calendar">
              <CalendarDays className="w-4 h-4" />
              <span>Calendar</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Credits card + plan */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/15 to-blue-300/15 blur-3xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-blue-600">Posts balance</p>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-slate-900">
                {creditsRemaining.toLocaleString()}
                {creditsTotal > 0 && (
                  <span className="ml-2 text-base font-normal text-slate-400">
                    / {creditsTotal.toLocaleString()}
                  </span>
                )}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">
                {creditsTotal > 0
                  ? `${creditsPct}% remaining this cycle`
                  : 'Pick a plan to start publishing.'}
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 sm:px-5 h-10 shadow-md shadow-blue-500/30 text-sm"
            >
              <Link to="/dashboard/billing">
                <Sparkles className="w-4 h-4" />
                {creditsTotal > 0 ? 'Manage plan' : 'Choose a plan'}
              </Link>
            </Button>
          </div>
          {creditsTotal > 0 && (
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                style={{ width: `${creditsPct}%` }}
              />
            </div>
          )}
        </div>

        <Link
          to="/dashboard/billing"
          className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-300/25 to-rose-300/15 blur-2xl group-hover:opacity-80 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-md shrink-0">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-amber-700">{isActive && !isCancelled ? 'Current plan' : 'Choose again'}</p>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 truncate">{planName}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              View plans <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar + Upcoming */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-3">
        {/* Mini calendar */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200/70">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
                {format(cursor, 'yyyy')}
              </p>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                {format(cursor, 'MMMM')}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-slate-300 h-9"
            >
              <Link to="/dashboard/calendar">
                Full calendar
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-7 bg-slate-50/60">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div
                key={i}
                className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 text-center py-2"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayPosts = postsByDay.get(key) || [];
              const inMonth = isSameMonth(day, cursor);
              const today = isToday(day);
              const hasScheduled = dayPosts.some((p) => p.status === 'scheduled' || p.status === 'queued');
              const hasPublished = dayPosts.some((p) => p.status === 'published' || p.status === 'posted');
              return (
                <Link
                  key={key}
                  to="/dashboard/calendar"
                  className={cn(
                    'relative aspect-square p-1.5 text-left border-r border-b border-slate-200/70 last:border-r-0 text-xs',
                    inMonth ? 'bg-white hover:bg-blue-50/50' : 'bg-slate-50/50 text-slate-400',
                    isSameDay(day, cursor) && 'ring-1 ring-blue-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium',
                      today
                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/40'
                        : inMonth
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayPosts.length > 0 && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                      {hasScheduled && <span className="w-1 h-1 rounded-full bg-amber-500" />}
                      {hasPublished && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                      {dayPosts.length > 2 && <span className="w-1 h-1 rounded-full bg-blue-500" />}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-200/70 flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published
            </span>
          </div>
        </div>

        {/* Upcoming panel */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200/70 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
                Upcoming
              </p>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Next posts
              </p>
            </div>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-slate-500 mb-4">No upcoming posts.</p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 h-9"
                >
                  <Link to="/dashboard/scheduled">
                    Schedule one
                  </Link>
                </Button>
              </div>
            ) : (
              upcoming.map(({ p, d }) => (
                <Link
                  key={p.id}
                  to="/dashboard/calendar"
                  className="block bg-white rounded-xl border border-slate-200/70 p-3 hover:shadow-md hover:shadow-blue-500/10 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      Scheduled
                    </span>
                    {d && (
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {format(d, 'MMM d · HH:mm')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed">
                    {p.content?.slice(0, 90) || <span className="italic text-slate-400">(no caption)</span>}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Coming soon */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-sm flex items-center gap-4 flex-wrap">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/50" />
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="relative flex-1 min-w-0">
          <p className="font-semibold text-slate-900">Detailed metrics coming soon</p>
          <p className="text-sm text-slate-500">
            Engagement, reach, and audience insights will live here.
          </p>
        </div>
        <div className="relative inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium shrink-0">
          <BarChart3 className="w-3.5 h-3.5" />
          In development
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

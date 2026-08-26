import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  addDays,
  isValid,
} from 'date-fns';
import { usePostStore, resolveMediaUrl, type Post, type Platform } from '@/stores/postStore';
import { Button } from '@/components/ui/button';
import PostForm, { type PostMode } from '@/components/PostForm';
import PostDetails from '@/components/PostDetails';
import AuthImage from '@/components/AuthImage';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Clock,
  CheckCircle2,
  FileText,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

const PLATFORM_DOT: Record<Platform, string> = {
  twitter: 'bg-[hsl(203,89%,53%)]',
  linkedin: 'bg-[hsl(210,80%,42%)]',
  facebook: 'bg-[hsl(221,44%,41%)]',
  instagram: 'bg-gradient-to-br from-pink-500 to-orange-400',
  youtube: 'bg-[hsl(0,100%,50%)]',
};

const STATUS_BADGE = (p: Post) => {
  if (p.status === 'scheduled' || p.status === 'queued') {
    return { label: 'Scheduled', className: 'text-amber-700 bg-amber-50 border border-amber-200', Icon: Clock };
  }
  if (p.status === 'published' || p.status === 'posted') {
    return { label: 'Published', className: 'text-emerald-700 bg-emerald-50 border border-emerald-200', Icon: CheckCircle2 };
  }
  if (p.status === 'draft') {
    return { label: 'Draft', className: 'text-slate-700 bg-slate-50 border border-slate-200', Icon: FileText };
  }
  if (p.status === 'failed') {
    return { label: 'Failed', className: 'text-red-700 bg-red-50 border border-red-200', Icon: Clock };
  }
  return { label: p.status, className: 'text-slate-700 bg-slate-50 border border-slate-200', Icon: Clock };
};

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

// First available image (gallery / single / uploaded file) resolved to an
// absolute URL so the thumbnail loads through the ngrok-aware AuthImage.
const getFirstImage = (p: Post): string | null => {
  if (p.images && p.images.length > 0) return resolveMediaUrl(p.images[0]);
  if (p.image) return resolveMediaUrl(p.image);
  if (p.media_file) return resolveMediaUrl(p.media_file);
  return null;
};

const CalendarPage = () => {
  const {
    posts,
    scheduledPosts,
    fetchPosts,
    fetchScheduledPosts,
    isLoading,
    isLoadingScheduled,
  } = usePostStore();

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(() => startOfDay(new Date()));
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<PostMode>('schedule');

  useEffect(() => {
    fetchPosts().catch(() => {});
    fetchScheduledPosts().catch(() => {});
  }, [fetchPosts, fetchScheduledPosts]);

  // Merge posts (dedupe by id — scheduled ones may also appear in posts list)
  const allPosts = useMemo(() => {
    const map = new Map<number, Post>();
    scheduledPosts.forEach((p) => map.set(p.id, p));
    posts.forEach((p) => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [posts, scheduledPosts]);

  // Group posts by yyyy-MM-dd
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

  // Build 6-week grid
  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push(d);
  }

  const selectedKey = format(selected, 'yyyy-MM-dd');
  const selectedPosts = (postsByDay.get(selectedKey) || []).slice().sort((a, b) => {
    const da = getPostDate(a)?.getTime() ?? 0;
    const db = getPostDate(b)?.getTime() ?? 0;
    return da - db;
  });

  // Counts for the current month (header stats)
  const monthStats = useMemo(() => {
    const mStart = startOfMonth(cursor);
    const mEnd = endOfMonth(cursor);
    let scheduled = 0;
    let published = 0;
    allPosts.forEach((p) => {
      const d = getPostDate(p);
      if (!d || d < mStart || d > mEnd) return;
      if (p.status === 'scheduled' || p.status === 'queued') scheduled++;
      else if (p.status === 'published' || p.status === 'posted') published++;
    });
    return { scheduled, published };
  }, [allPosts, cursor]);

  const loading = isLoading || isLoadingScheduled;

  if (createOpen) {
    return (
      <div className="max-w-4xl mx-auto">
        <PostForm
          mode={createMode}
          onSuccess={() => {
            fetchPosts().catch(() => {});
            fetchScheduledPosts().catch(() => {});
            setCreateOpen(false);
          }}
          onCancel={() => setCreateOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-slide-up space-y-4">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-blue-600 to-blue-400 p-5 sm:p-6 text-white shadow-xl shadow-blue-500/30">
        <div className="absolute -top-20 -left-10 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-xl min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/90 bg-white/15 backdrop-blur px-2 py-0.5 rounded-full border border-white/20">
              <Sparkles className="w-3 h-3" />
              Content Calendar
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Plan and review everything.
            </h2>
            <p className="mt-1 text-sm text-white/80">
              See every scheduled and published post at a glance.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-white/15 backdrop-blur border border-white/20 rounded-xl px-3 py-2 text-center min-w-[80px]">
              <p className="text-xl font-bold tabular-nums leading-tight">{monthStats.scheduled}</p>
              <p className="text-[10px] text-white/80 uppercase tracking-wide">Scheduled</p>
            </div>
            <div className="bg-white/15 backdrop-blur border border-white/20 rounded-xl px-3 py-2 text-center min-w-[80px]">
              <p className="text-xl font-bold tabular-nums leading-tight">{monthStats.published}</p>
              <p className="text-[10px] text-white/80 uppercase tracking-wide">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((c) => subMonths(c, 1))}
            className="rounded-lg border-slate-300 h-9 w-9 shrink-0"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-1 sm:px-3 min-w-[8rem] sm:min-w-[10rem] text-center">
            <p className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
              {format(cursor, 'MMMM yyyy')}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="rounded-lg border-slate-300 h-9 w-9 shrink-0"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              setCursor(startOfMonth(now));
              setSelected(startOfDay(now));
            }}
            className="ml-1 sm:ml-2 rounded-full border-slate-300 h-9 px-3 sm:px-4 text-xs sm:text-sm"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 mr-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Published
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Draft
            </span>
          </div>
          <Button
            onClick={() => {
              setCreateMode('schedule');
              setCreateOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-3 sm:px-4 h-9 shadow-md shadow-blue-500/30 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Schedule post</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>

      {loading && allPosts.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-3">
          {/* Calendar grid */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden min-w-0">
            {/* Weekday header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
              {[
                { full: 'Sun', short: 'S' },
                { full: 'Mon', short: 'M' },
                { full: 'Tue', short: 'T' },
                { full: 'Wed', short: 'W' },
                { full: 'Thu', short: 'T' },
                { full: 'Fri', short: 'F' },
                { full: 'Sat', short: 'S' },
              ].map((d) => (
                <div
                  key={d.full}
                  className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-500 text-center py-2 sm:py-3"
                >
                  <span className="hidden sm:inline">{d.full}</span>
                  <span className="sm:hidden">{d.short}</span>
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayPosts = postsByDay.get(key) || [];
                const inMonth = isSameMonth(day, cursor);
                const isSel = isSameDay(day, selected);
                const today = isToday(day);
                // Show only one rich preview; everything else collapses into "+N more".
                const primaryPost = dayPosts[0];
                const extra = Math.max(0, dayPosts.length - 1);
                const hasScheduled = dayPosts.some((p) => p.status === 'scheduled' || p.status === 'queued');
                const hasPublished = dayPosts.some((p) => p.status === 'published' || p.status === 'posted');
                const hasFailed = dayPosts.some((p) => p.status === 'failed');

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(startOfDay(day))}
                    className={cn(
                      'relative aspect-square sm:aspect-auto sm:min-h-[96px] md:min-h-[104px] p-1 sm:p-2 text-left border-r border-b border-slate-200 last:border-r-0 transition-colors',
                      inMonth ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/50 text-slate-400 hover:bg-slate-100/60',
                      isSel && 'ring-2 ring-inset ring-blue-500/60 bg-blue-50/60'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-[11px] sm:text-xs font-medium rounded-full',
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
                        <span className="hidden sm:inline-flex text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                          {dayPosts.length}
                        </span>
                      )}
                    </div>

                    {/* Mobile: just dots */}
                    {dayPosts.length > 0 && (
                      <div className="sm:hidden absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                        {hasScheduled && <span className="w-1 h-1 rounded-full bg-amber-500" />}
                        {hasPublished && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                        {hasFailed && <span className="w-1 h-1 rounded-full bg-red-500" />}
                        {dayPosts.length > 2 && !hasScheduled && !hasPublished && <span className="w-1 h-1 rounded-full bg-blue-500" />}
                      </div>
                    )}

                    {/* Desktop/tablet: image-only preview + "+N more" */}
                    <div className="hidden sm:block mt-1.5 space-y-1">
                      {primaryPost && (() => {
                        const p = primaryPost;
                        const isScheduled = p.status === 'scheduled' || p.status === 'queued';
                        const isPublished = p.status === 'published' || p.status === 'posted';
                        const dotClass = isPublished
                          ? 'bg-emerald-500'
                          : isScheduled
                          ? 'bg-amber-500'
                          : p.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-slate-400';
                        const thumb = getFirstImage(p);
                        return thumb ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailPost(p);
                            }}
                            className="relative w-full aspect-square rounded-md overflow-hidden cursor-pointer ring-1 ring-slate-200 hover:ring-blue-400 hover:shadow-sm transition-all"
                          >
                            <AuthImage
                              src={thumb}
                              alt=""
                              className="w-full h-full object-cover"
                              wrapperClassName="w-full h-full"
                            />
                            <span
                              className={cn(
                                'absolute bottom-1 right-1 w-2 h-2 rounded-full ring-2 ring-white',
                                dotClass
                              )}
                            />
                          </div>
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailPost(p);
                            }}
                            className={cn(
                              'w-full aspect-square rounded-md cursor-pointer flex items-center justify-center text-white font-semibold text-xs hover:opacity-90 transition-opacity',
                              'bg-gradient-to-br from-blue-500 to-sky-400'
                            )}
                          >
                            <span className={cn('w-2.5 h-2.5 rounded-full ring-2 ring-white/60', dotClass)} />
                          </div>
                        );
                      })()}
                      {extra > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(startOfDay(day));
                          }}
                          className="block w-full text-center text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          +{extra} more
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          <div className="space-y-3 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="relative px-4 py-3 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-blue-600 uppercase truncate">
                      {format(selected, 'EEEE')}
                    </p>
                    <p className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                      {format(selected, 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {selectedPosts.length === 0
                    ? 'Nothing scheduled or published for this day.'
                    : `${selectedPosts.length} ${selectedPosts.length === 1 ? 'post' : 'posts'}`}
                </p>
              </div>

              <div className="p-3 space-y-2 lg:max-h-[520px] lg:overflow-y-auto">
                {selectedPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mx-auto mb-3">
                      <CalendarClock className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      Add a post to this day.
                    </p>
                    <Button
                      onClick={() => {
                        setCreateMode('schedule');
                        setCreateOpen(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 h-9"
                    >
                      <Plus className="w-4 h-4" />
                      Schedule post
                    </Button>
                  </div>
                ) : (
                  selectedPosts.map((p) => {
                    const badge = STATUS_BADGE(p);
                    const Badge = badge.Icon;
                    const time = getPostDate(p);
                    const preview = (p.content || '').slice(0, 110);
                    const needsMore = (p.content || '').length > 110;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setDetailPost(p)}
                        className="w-full text-left bg-white rounded-xl border border-slate-200/70 p-3 hover:shadow-md hover:shadow-blue-500/10 hover:border-blue-300 hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full',
                              badge.className
                            )}
                          >
                            <Badge className="w-3 h-3" />
                            {badge.label}
                          </span>
                          {time && (
                            <span className="text-[11px] text-slate-500 tabular-nums">
                              {format(time, 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed">
                          {preview || <span className="italic text-slate-400">(no caption)</span>}
                          {needsMore && '…'}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          {p.platforms.map((pl) => {
                            const Icon = PLATFORM_ICONS[pl];
                            return (
                              <div
                                key={pl}
                                className={cn(
                                  'w-5 h-5 rounded flex items-center justify-center',
                                  PLATFORM_DOT[pl]
                                )}
                              >
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <PostDetails
        post={detailPost}
        open={detailPost !== null}
        onOpenChange={(open) => {
          if (!open) setDetailPost(null);
        }}
      />
    </div>
  );
};

export default CalendarPage;

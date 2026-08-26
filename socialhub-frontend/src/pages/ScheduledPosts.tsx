import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostStore, resolveMediaUrl, type Post, type PostStatus, type Platform, type SchedulingSlot } from '@/stores/postStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Trash2, Clock, CheckCircle2, XCircle, Twitter,
  Linkedin, Facebook, Instagram, Youtube, Calendar, Plus, Loader2, ListOrdered,
  Loader, FileText, Eye, CalendarClock, CalendarDays, List, AlertTriangle, Images, Play, MessageSquare,
  Settings, Pencil, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PostForm, { type PostMode } from '@/components/PostForm';
import PostDetails from '@/components/PostDetails';
import ConfirmDialog from '@/components/ConfirmDialog';
import ViewToggle from '@/components/ViewToggle';
import { useViewMode } from '@/hooks/useViewMode';
import AuthImage from '@/components/AuthImage';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const STATUS_CONFIG: Record<PostStatus, { label: string; icon: React.ElementType; className: string }> = {
  scheduled: { label: 'Scheduled', icon: Clock, className: 'text-amber-700 bg-amber-50 border border-amber-200' },
  queued: { label: 'Queued', icon: ListOrdered, className: 'text-blue-700 bg-blue-50 border border-blue-200' },
  pending: { label: 'Pending', icon: Loader, className: 'text-amber-700 bg-amber-50 border border-amber-200' },
  processing: { label: 'Processing', icon: Loader, className: 'text-blue-700 bg-blue-50 border border-blue-200' },
  published: { label: 'Published', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
  posted: { label: 'Posted', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
  failed: { label: 'Failed', icon: XCircle, className: 'text-red-700 bg-red-50 border border-red-200' },
  draft: { label: 'Draft', icon: FileText, className: 'text-slate-700 bg-slate-50 border border-slate-200' },
  partial: { label: 'Partial', icon: CheckCircle2, className: 'text-amber-700 bg-amber-50 border border-amber-200' },
};

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// "09:00:00" → "9:00 AM"
const formatSlotTime = (time: string): string => {
  const [h = '0', m = '00'] = time.split(':');
  const hr = Number(h);
  const period = hr >= 12 ? 'PM' : 'AM';
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return `${display}:${m} ${period}`;
};

type SlotForm = { day_of_week: string; time: string };

const ScheduledPosts = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [createMode, setCreateMode] = useState<PostMode>('queue');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Slot management state
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SchedulingSlot | null>(null);
  const [slotForm, setSlotForm] = useState<SlotForm>({ day_of_week: '0', time: '09:00' });
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotDeleteTarget, setSlotDeleteTarget] = useState<SchedulingSlot | null>(null);
  const [slotDeleting, setSlotDeleting] = useState(false);

  const {
    scheduledPosts,
    schedulingSlots,
    deleteScheduledPost,
    fetchScheduledPosts,
    isLoadingScheduled,
    createSchedulingSlot,
    updateSchedulingSlot,
    deleteSchedulingSlot,
  } = usePostStore();

  useEffect(() => { fetchScheduledPosts().catch(() => {}); }, [fetchScheduledPosts]);

  // Sort slots by day then time for a stable, predictable order.
  const sortedSlots = [...schedulingSlots].sort(
    (a, b) => a.day_of_week - b.day_of_week || a.time.localeCompare(b.time)
  );

  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useViewMode('scheduledPosts.viewMode', 'list');

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteScheduledPost(deleteTarget.id);
      toast.success('Scheduled post deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(String(err ?? 'Failed to delete'));
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = (mode: PostMode) => {
    setCreateMode(mode);
    setView('create');
  };

  const openAddSlot = () => {
    setEditingSlot(null);
    setSlotForm({ day_of_week: '0', time: '09:00' });
    setSlotDialogOpen(true);
  };

  const openEditSlot = (slot: SchedulingSlot) => {
    setEditingSlot(slot);
    setSlotForm({ day_of_week: String(slot.day_of_week), time: slot.time.slice(0, 5) });
    setSlotDialogOpen(true);
  };

  const saveSlot = async () => {
    setSlotSaving(true);
    try {
      const payload = { day_of_week: Number(slotForm.day_of_week), time: slotForm.time };
      if (editingSlot) {
        await updateSchedulingSlot(editingSlot.id, payload);
        toast.success('Slot updated');
      } else {
        await createSchedulingSlot(payload);
        toast.success('Slot added');
      }
      setSlotDialogOpen(false);
    } catch (err) {
      toast.error(String(err ?? 'Failed to save slot'));
    } finally {
      setSlotSaving(false);
    }
  };

  const confirmDeleteSlot = async () => {
    if (!slotDeleteTarget) return;
    setSlotDeleting(true);
    try {
      await deleteSchedulingSlot(slotDeleteTarget.id);
      toast.success('Slot removed');
      setSlotDeleteTarget(null);
    } catch (err) {
      toast.error(String(err ?? 'Failed to delete slot'));
    } finally {
      setSlotDeleting(false);
    }
  };

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto">
        <PostForm
          mode={createMode}
          onSuccess={() => { fetchScheduledPosts().catch(() => {}); setView('list'); }}
          onCancel={() => setView('list')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-sm">
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/15 to-blue-400/15 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              <CalendarClock className="w-3 h-3" />
              Scheduled
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Scheduled Posts</h2>
            <p className="text-xs sm:text-sm text-slate-500">Content lined up to publish on your schedule.</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center w-full sm:w-auto">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-500/30"
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <Link
                to="/dashboard/calendar"
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar
              </Link>
            </div>
            <Button
              variant="outline"
              onClick={() => openCreate('schedule')}
              className="rounded-full px-3 sm:px-4 h-10 border-slate-300 hover:border-blue-300 hover:text-blue-600 bg-white text-xs sm:text-sm"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Specific Time</span>
              <span className="sm:hidden">Time</span>
            </Button>
            <Button
              onClick={() => openCreate('queue')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 sm:px-5 h-10 shadow-md shadow-blue-500/30 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add to Queue</span>
              <span className="xs:hidden">Queue</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly posting slots */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
              Weekly slots
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              Queued posts auto-fill the next open slot.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
              {sortedSlots.length} {sortedSlots.length === 1 ? 'slot' : 'slots'} / week
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={openAddSlot}
              className="rounded-full h-7 px-3 text-[11px] border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-3 h-3" />
              Add slot
            </Button>
          </div>
        </div>
        {sortedSlots.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No slots configured. Add one to enable queue scheduling.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {sortedSlots.map((slot) => {
              const dayLabel = slot.day_of_week_display || DAY_LABELS[slot.day_of_week] || `Day ${slot.day_of_week}`;
              return (
                <span
                  key={slot.id}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 text-[11px] font-medium text-blue-700"
                >
                  <CalendarClock className="w-3 h-3" />
                  {dayLabel}
                  <span className="text-blue-300">·</span>
                  <span className="tabular-nums">{formatSlotTime(slot.time)}</span>
                  <button
                    type="button"
                    onClick={() => openEditSlot(slot)}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-900"
                    title="Edit slot"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotDeleteTarget(slot)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                    title="Remove slot"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {scheduledPosts.length > 0 && !isLoadingScheduled && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <p className="text-xs text-slate-500 tabular-nums">
            {scheduledPosts.length} {scheduledPosts.length === 1 ? 'post' : 'posts'} queued
          </p>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      )}

      {isLoadingScheduled ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : scheduledPosts.length === 0 ? (
        <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 p-8 text-center shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/50" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-slate-900 mb-1">No scheduled posts</p>
            <p className="text-sm text-slate-500 mb-4">Schedule a post to publish it later.</p>
            <Button
              onClick={() => openCreate('queue')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 h-9"
            >
              <Plus className="w-4 h-4" />
              Add to Queue
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-white rounded-2xl border border-slate-200/70 shadow-sm">
          {scheduledPosts.map((post) => (
            <ScheduledTile
              key={post.id}
              post={post}
              onClick={() => setSelectedPost(post)}
              onDelete={() => setDeleteTarget(post)}
            />
          ))}
        </div>
      ) : viewMode === 'detailed' ? (
        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <ScheduledDetail
              key={post.id}
              post={post}
              onClick={() => setSelectedPost(post)}
              onDelete={() => setDeleteTarget(post)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {scheduledPosts.map((post, index) => {
            const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.scheduled;
            const StatusIcon = statusCfg.icon;
            const hasLoader = post.status === 'processing' || post.status === 'pending';
            const when = post.scheduled_time || post.created_at;
            const PREVIEW_LEN = 120;
            const needsMore = post.content && post.content.length > PREVIEW_LEN;
            const preview = needsMore ? post.content.slice(0, PREVIEW_LEN).trimEnd() : post.content;
            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm animate-slide-up cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 mb-2 break-words leading-relaxed">
                      {preview || <span className="italic text-slate-400">(no caption)</span>}
                      {needsMore && (
                        <>
                          …{' '}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                            className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium"
                          >
                            see more
                          </button>
                        </>
                      )}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', statusCfg.className)}>
                        <StatusIcon className={cn('w-3 h-3', hasLoader && 'animate-spin')} />
                        {statusCfg.label}
                      </span>
                      {(post.target_account_details ?? []).slice(0, 3).map((acc) => {
                        const Icon = PLATFORM_ICONS[acc.platform];
                        const handle = acc.platform_username || acc.display_name || '';
                        return (
                          <span
                            key={acc.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full"
                          >
                            <Icon className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[9rem]">@{handle}</span>
                          </span>
                        );
                      })}
                      {(post.target_account_details?.length ?? 0) === 0 && (
                        <div className="flex items-center gap-1">
                          {post.platforms.map((p) => {
                            const Icon = PLATFORM_ICONS[p];
                            return <Icon key={p} className="w-3.5 h-3.5 text-slate-400" />;
                          })}
                        </div>
                      )}
                      {when && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {new Date(when).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                      className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 rounded-lg"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(post); }}
                      className="text-slate-400 hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PostDetails
        post={selectedPost}
        open={selectedPost !== null}
        onOpenChange={(open) => { if (!open) setSelectedPost(null); }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}
        title="Delete this scheduled post?"
        description={
          deleteTarget
            ? `This will cancel post #${deleteTarget.id} before it publishes. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete post"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />

      {/* Add / Edit slot dialog */}
      <Dialog open={slotDialogOpen} onOpenChange={(o) => { if (!slotSaving) setSlotDialogOpen(o); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingSlot ? 'Edit Slot' : 'Add Scheduling Slot'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Day of week</Label>
              <Select
                value={slotForm.day_of_week}
                onValueChange={(v) => setSlotForm((f) => ({ ...f, day_of_week: v }))}
              >
                <SelectTrigger className="h-9 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_LABELS.map((d, i) => (
                    <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Time</Label>
              <Input
                type="time"
                value={slotForm.time}
                onChange={(e) => setSlotForm((f) => ({ ...f, time: e.target.value }))}
                className="h-9 rounded-lg text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSlotDialogOpen(false)}
              disabled={slotSaving}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveSlot}
              disabled={slotSaving || !slotForm.time}
              className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white"
            >
              {slotSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingSlot ? 'Save changes' : 'Add slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete slot confirm */}
      <ConfirmDialog
        open={slotDeleteTarget !== null}
        onOpenChange={(open) => { if (!open && !slotDeleting) setSlotDeleteTarget(null); }}
        title="Remove this slot?"
        description={
          slotDeleteTarget
            ? `Remove the ${slotDeleteTarget.day_of_week_display || DAY_LABELS[slotDeleteTarget.day_of_week]} ${formatSlotTime(slotDeleteTarget.time)} slot from your weekly schedule?`
            : undefined
        }
        confirmLabel="Remove slot"
        destructive
        loading={slotDeleting}
        onConfirm={confirmDeleteSlot}
      />
    </div>
  );
};

/* ─────────────────────────── Media helpers ─────────────────────────── */

const getFirstImage = (p: Post): string | null => {
  if (p.images && p.images.length > 0) return resolveMediaUrl(p.images[0]);
  if (p.image) return resolveMediaUrl(p.image);
  if (p.media_file) return resolveMediaUrl(p.media_file);
  return null;
};

const getVideoSrc = (p: Post): string | null => {
  if (p.video) return resolveMediaUrl(p.video);
  if (p.video_file) return resolveMediaUrl(p.video_file);
  return null;
};

interface TileProps {
  post: Post;
  onClick: () => void;
  onDelete: () => void;
}

/* ─────────────────────────── Grid tile (Instagram-ish) ─────────────────────────── */

const ScheduledTile = ({ post, onClick, onDelete }: TileProps) => {
  const image = getFirstImage(post);
  const video = getVideoSrc(post);
  const imageCount = (post.images?.length ?? 0) + (post.image ? 1 : 0);
  const isCarousel = imageCount > 1;
  const when = post.scheduled_time || post.created_at;
  const timeStr = when ? new Date(when).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const statusCls = post.status === 'failed' ? 'bg-red-500'
    : post.status === 'partial' ? 'bg-amber-500'
    : post.status === 'published' || post.status === 'posted' ? 'bg-emerald-500'
    : 'bg-amber-500';

  return (
    <div
      onClick={onClick}
      className="group relative aspect-square bg-slate-100 overflow-hidden cursor-pointer"
    >
      {image ? (
        <AuthImage src={image} alt="" loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          wrapperClassName="w-full h-full" />
      ) : video ? (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
          <Play className="w-10 h-10 text-white/70" fill="currentColor" />
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-3">
          <p className="text-[11px] text-slate-700 text-center line-clamp-6 leading-snug">
            {post.content || <span className="italic text-slate-400">(no caption)</span>}
          </p>
        </div>
      )}

      <div className={cn('absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white/80 shadow-sm', statusCls)} />
      {isCarousel && (
        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/45 backdrop-blur-sm text-white flex items-center justify-center">
          <Images className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
        {post.platforms.map((p) => {
          const Icon = PLATFORM_ICONS[p];
          return (
            <div key={p} className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow ring-1 ring-white/40">
              <Icon className="w-2.5 h-2.5" />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
        <p className="text-white text-[11px] line-clamp-3 leading-snug mb-1.5">
          {post.content || <span className="italic text-white/70">(no caption)</span>}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/80 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeStr}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-6 h-6 rounded-md bg-white/15 hover:bg-red-500/90 text-white flex items-center justify-center"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Detailed card ─────────────────────────── */

const ScheduledDetail = ({ post, onClick, onDelete }: TileProps) => {
  const image = getFirstImage(post);
  const video = getVideoSrc(post);
  const imageCount = (post.images?.length ?? 0) + (post.image ? 1 : 0);
  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.scheduled;
  const StatusIcon = statusCfg.icon;
  const hasLoader = post.status === 'processing' || post.status === 'pending';
  const when = post.scheduled_time || post.created_at;

  return (
    <div
      onClick={onClick}
      className="grid md:grid-cols-[200px_1fr] gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="relative aspect-square md:aspect-auto md:h-full rounded-xl overflow-hidden bg-slate-100">
        {image ? (
          <AuthImage src={image} alt="" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
        ) : video ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
            <Play className="w-10 h-10 text-white/80" fill="currentColor" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center p-3">
            <p className="text-[11px] text-slate-600 text-center line-clamp-6">
              {post.content?.trim() || '(no caption)'}
            </p>
          </div>
        )}
        {imageCount > 1 && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/45 backdrop-blur-sm text-white flex items-center justify-center">
            <Images className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full', statusCfg.className)}>
            <StatusIcon className={cn('w-3 h-3', hasLoader && 'animate-spin')} />
            {statusCfg.label}
          </span>
          {post.platforms.map((p) => {
            const Icon = PLATFORM_ICONS[p];
            return (
              <span key={p} className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                <Icon className="w-3 h-3 text-slate-500" />
                {p}
              </span>
            );
          })}
          {when && (
            <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(when).toLocaleString()}
            </span>
          )}
        </div>

        {post.target_account_details && post.target_account_details.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.target_account_details.map((acc) => {
              const Icon = PLATFORM_ICONS[acc.platform];
              const handle = acc.platform_username || acc.display_name || '';
              return (
                <span
                  key={acc.id}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full"
                >
                  <Icon className="w-3 h-3 text-slate-500" />
                  @{handle}
                </span>
              );
            })}
          </div>
        )}

        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
          {post.content?.trim() || <span className="italic text-slate-400">(no caption)</span>}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 border-slate-300"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <Eye className="w-3.5 h-3.5" />
            View details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-8 text-slate-500 hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPosts;

import { useState, useEffect, useMemo } from 'react';
import {
  usePostStore,
  type Post,
  type PostStatus,
  type Platform,
  resolveMediaUrl,
} from '@/stores/postStore';
import { useAccountStore } from '@/stores/accountStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Loader2,
  Trash2,
  Clock,
  MessageSquare,
  Plus,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Sparkles,
  Play,
  Images,
  Grid3x3,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PostForm from '@/components/PostForm';
import PostDetails from '@/components/PostDetails';
import AuthImage from '@/components/AuthImage';
import ConfirmDialog from '@/components/ConfirmDialog';
import ViewToggle from '@/components/ViewToggle';
import { useViewMode } from '@/hooks/useViewMode';

/* ─────────────────────────── Platform metadata ─────────────────────────── */

const PLATFORM_META: Record<
  Platform,
  { label: string; icon: React.ElementType; gradient: string; underline: string }
> = {
  twitter: {
    label: 'Twitter',
    icon: Twitter,
    gradient: 'from-slate-900 to-slate-600',
    underline: 'from-slate-800 to-slate-500',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: Linkedin,
    gradient: 'from-sky-700 to-sky-500',
    underline: 'from-sky-700 to-sky-500',
  },
  facebook: {
    label: 'Facebook',
    icon: Facebook,
    gradient: 'from-blue-700 to-blue-500',
    underline: 'from-blue-700 to-blue-500',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    gradient: 'from-pink-500 via-fuchsia-500 to-orange-400',
    underline: 'from-pink-500 via-fuchsia-500 to-orange-400',
  },
  youtube: {
    label: 'YouTube',
    icon: Youtube,
    gradient: 'from-red-600 to-red-400',
    underline: 'from-red-600 to-red-400',
  },
};

const PLATFORMS: Platform[] = ['twitter', 'linkedin', 'facebook', 'instagram', 'youtube'];

type TabKey = 'all' | 'drafts' | Platform;

const PUBLISHED_STATUSES: PostStatus[] = [
  'published',
  'posted',
  'partial',
  'failed',
  'pending',
  'processing',
];

// Drafts can either carry `status === 'draft'` or a legacy `is_draft` flag.
const isDraftPost = (p: Post): boolean =>
  p.status === 'draft' || Boolean((p as unknown as { is_draft?: boolean }).is_draft);

/* ─────────────────────────── Media helpers ─────────────────────────── */

const getFirstImage = (post: Post): string | null => {
  if (post.images && post.images.length > 0) return resolveMediaUrl(post.images[0]);
  if (post.image) return resolveMediaUrl(post.image);
  if (post.media_file) return resolveMediaUrl(post.media_file);
  return null;
};

const getVideoSrc = (post: Post): string | null => {
  if (post.video) return resolveMediaUrl(post.video);
  if (post.video_file) return resolveMediaUrl(post.video_file);
  return null;
};

const countOnPlatform = (posts: Post[], platform: Platform) =>
  posts.filter((p) => p.platforms.includes(platform)).length;

/* ─────────────────────────── Page ─────────────────────────── */

const Posts = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingDraft, setEditingDraft] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useViewMode('posts.viewMode', 'grid');
  const { posts, fetchPosts, deletePost, isLoading } = usePostStore();
  const { accounts, fetchAccounts } = useAccountStore();

  useEffect(() => {
    fetchPosts().catch(() => {});
    fetchAccounts().catch(() => {});
  }, [fetchPosts, fetchAccounts]);

  const requestDelete = (post: Post) => setDeleteTarget(post);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget.id);
      toast.success('Post deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(String(err ?? 'Failed to delete post'));
    } finally {
      setDeleting(false);
    }
  };

  // Drafts are surfaced alongside published posts in the "All" and platform
  // tabs so users can jump straight into editing without switching tabs.
  const drafts = useMemo(() => posts.filter(isDraftPost), [posts]);
  const allVisible = useMemo(
    () => posts.filter((p) => PUBLISHED_STATUSES.includes(p.status) || isDraftPost(p)),
    [posts]
  );

  // Only show tabs for platforms the user has connected OR has posted to.
  const visiblePlatforms = useMemo(() => {
    return PLATFORMS.filter((p) => {
      const hasAccount = accounts.some((a) => a.platform === p);
      const hasPost = allVisible.some((post) => post.platforms.includes(p));
      return hasAccount || hasPost;
    });
  }, [accounts, allVisible]);

  const filteredPosts = useMemo(() => {
    if (activeTab === 'all') return allVisible;
    if (activeTab === 'drafts') return drafts;
    return allVisible.filter((p) => p.platforms.includes(activeTab));
  }, [allVisible, drafts, activeTab]);

  // Click router — drafts open the PostForm in edit mode; everything else
  // opens the read-only details dialog.
  const handlePostClick = (post: Post) => {
    if (isDraftPost(post)) {
      setEditingDraft(post);
      setView('create');
    } else {
      setSelectedPost(post);
    }
  };

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto">
        <PostForm
          mode={editingDraft ? 'draft' : 'post'}
          editingPost={editingDraft}
          onSuccess={() => {
            fetchPosts().catch(() => {});
            setEditingDraft(null);
            setView('list');
          }}
          onCancel={() => {
            setEditingDraft(null);
            setView('list');
          }}
        />
      </div>
    );
  }

  const activeLabel =
    activeTab === 'all'
      ? 'posts'
      : activeTab === 'drafts'
      ? 'drafts'
      : `${PLATFORM_META[activeTab].label} posts`;

  return (
    <div className="max-w-5xl mx-auto animate-slide-up space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-sm">
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/15 to-blue-400/15 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Gallery
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Posts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Every piece of content you've shipped, organized by network.
            </p>
          </div>
          <Button
            onClick={() => setView('create')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 sm:px-5 h-10 sm:h-11 shadow-md shadow-blue-500/30 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Create Post</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Tab bar + grid */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div
          className="flex overflow-x-auto border-b border-slate-200/70"
          style={{ scrollbarWidth: 'none' }}
        >
          <TabButton
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            icon={Grid3x3}
            label="All"
            count={allVisible.length}
            underline="from-blue-600 to-blue-400"
          />
          {drafts.length > 0 && (
            <TabButton
              active={activeTab === 'drafts'}
              onClick={() => setActiveTab('drafts')}
              icon={FileText}
              label="Drafts"
              count={drafts.length}
              underline="from-slate-700 to-slate-500"
            />
          )}
          {visiblePlatforms.map((platform) => {
            const meta = PLATFORM_META[platform];
            return (
              <TabButton
                key={platform}
                active={activeTab === platform}
                onClick={() => setActiveTab(platform)}
                icon={meta.icon}
                label={meta.label}
                count={countOnPlatform(allVisible, platform)}
                underline={meta.underline}
              />
            );
          })}
        </div>

        {/* View mode toolbar */}
        {filteredPosts.length > 0 && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200/70 bg-slate-50/40">
            <p className="text-xs text-slate-500 tabular-nums">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </p>
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="relative overflow-hidden p-10 sm:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/50" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/30">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No {activeLabel}</h3>
              <p className="text-sm text-slate-500 mb-4">
                {activeTab === 'all'
                  ? 'Create your first post to get started.'
                  : activeTab === 'drafts'
                  ? 'Save a draft to keep working on it later.'
                  : `Post something to ${PLATFORM_META[activeTab].label} to see it here.`}
              </p>
              <Button
                onClick={() => setView('create')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 h-9"
              >
                <Plus className="w-4 h-4" />
                Create one
              </Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-0.5 sm:gap-1 p-0.5 sm:p-1">
            {filteredPosts.map((post, index) => (
              <PostTile
                key={post.id}
                post={post}
                activePlatform={(activeTab === 'all' || activeTab === 'drafts') ? null : activeTab}
                onClick={() => handlePostClick(post)}
                onDelete={() => requestDelete(post)}
                animationDelay={index * 25}
              />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="divide-y divide-slate-200/70">
            {filteredPosts.map((post) => (
              <PostListRow
                key={post.id}
                post={post}
                activePlatform={(activeTab === 'all' || activeTab === 'drafts') ? null : activeTab}
                onClick={() => handlePostClick(post)}
                onDelete={() => requestDelete(post)}
              />
            ))}
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-3">
            {filteredPosts.map((post) => (
              <PostDetailCard
                key={post.id}
                post={post}
                activePlatform={(activeTab === 'all' || activeTab === 'drafts') ? null : activeTab}
                onClick={() => handlePostClick(post)}
                onDelete={() => requestDelete(post)}
              />
            ))}
          </div>
        )}
      </div>

      <PostDetails
        post={selectedPost}
        open={selectedPost !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null);
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete this post?"
        description={
          deleteTarget
            ? `This will remove post #${deleteTarget.id} from your gallery. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete post"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

/* ─────────────────────────── Tab button ─────────────────────────── */

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
  underline: string;
}

const TabButton = ({ active, onClick, icon: Icon, label, count, underline }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'relative flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium shrink-0 transition-colors',
      active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    )}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="whitespace-nowrap">{label}</span>
    <span
      className={cn(
        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center tabular-nums',
        active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
      )}
    >
      {count}
    </span>
    {active && (
      <span
        className={cn(
          'absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r',
          underline
        )}
      />
    )}
  </button>
);

/* ─────────────────────────── Grid tile ─────────────────────────── */

interface PostTileProps {
  post: Post;
  activePlatform: Platform | null;
  onClick: () => void;
  onDelete: () => void;
  animationDelay: number;
}

const PostTile = ({ post, activePlatform, onClick, onDelete, animationDelay }: PostTileProps) => {
  const image = getFirstImage(post);
  const video = getVideoSrc(post);
  const imageCount = (post.images?.length ?? 0) + (post.image ? 1 : 0);
  const isCarousel = imageCount > 1;
  const draft = isDraftPost(post);

  // Account usernames — prefer the new target_account_details field, fall back
  // to platform_results entries (which sometimes carry display_name + platform).
  const accountLabels = (() => {
    const details = post.target_account_details ?? [];
    if (details.length > 0) {
      // If a platform tab is active, show only accounts for that platform.
      const filtered = activePlatform
        ? details.filter((d) => d.platform === activePlatform)
        : details;
      return filtered.map((d) => ({
        platform: d.platform,
        handle: d.platform_username || d.display_name || '',
      }));
    }
    // Fallback: scan platform_results for display_name / platform pairs.
    return Object.entries(post.platform_results ?? {})
      .map(([, r]) => ({
        platform: (r.platform as Platform | undefined) ?? null,
        handle: r.display_name || '',
      }))
      .filter((x) => x.handle);
  })();
  const primaryHandle = accountLabels.find((a) => a.handle)?.handle ?? '';

  // Tile status — when a specific platform tab is open, show that platform's
  // outcome; otherwise use the overall post status.
  let tileStatusClass = 'bg-slate-400';
  if (activePlatform) {
    const r = post.platform_results?.[activePlatform];
    if (r?.success) tileStatusClass = 'bg-emerald-500';
    else if (r?.error) tileStatusClass = 'bg-red-500';
  } else {
    if (post.status === 'published' || post.status === 'posted') tileStatusClass = 'bg-emerald-500';
    else if (post.status === 'partial') tileStatusClass = 'bg-amber-500';
    else if (post.status === 'failed') tileStatusClass = 'bg-red-500';
  }

  const timeLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString()
    : new Date(post.created_at).toLocaleDateString();

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative aspect-square bg-slate-100 overflow-hidden cursor-pointer animate-slide-up',
        draft && 'outline outline-2 outline-dashed outline-slate-400/70 -outline-offset-4'
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Media / fallback */}
      {image ? (
        <AuthImage
          src={image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          wrapperClassName="w-full h-full"
        />
     ) : video ? (
        <div className="relative w-full h-full">
          <video src={video} preload="metadata" muted playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-10 h-10 text-white/70" fill="currentColor" />
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-3">
          <p className="text-[11px] sm:text-xs text-slate-700 line-clamp-6 text-center leading-snug">
            {post.content || <span className="italic text-slate-400">(no caption)</span>}
          </p>
        </div>
      )}

      {/* Top-left status — a Draft pill for drafts, a colored dot for everything else */}
      {draft ? (
        <div className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 bg-white/95 backdrop-blur text-slate-700 text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-md shadow-sm border border-slate-200">
          <FileText className="w-2.5 h-2.5" />
          Draft
        </div>
      ) : (
        <div
          className={cn(
            'absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white/80 shadow-sm',
            tileStatusClass
          )}
        />
      )}

      {/* Top-right: carousel / video indicator */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        {isCarousel && (
          <div className="w-6 h-6 rounded-md bg-black/45 backdrop-blur-sm flex items-center justify-center text-white">
            <Images className="w-3.5 h-3.5" />
          </div>
        )}
        {video && image && (
          <div className="w-6 h-6 rounded-md bg-black/45 backdrop-blur-sm flex items-center justify-center text-white">
            <Play className="w-3.5 h-3.5" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Bottom platform pills — always visible so the tab filter is obvious */}
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
        {post.platforms.map((p) => {
          const meta = PLATFORM_META[p];
          const Icon = meta.icon;
          const r = post.platform_results?.[p];
          const failed = Boolean(r?.error);
          return (
            <div
              key={p}
              className={cn(
                'w-5 h-5 rounded-md bg-gradient-to-br flex items-center justify-center text-white shadow ring-1 ring-white/40',
                meta.gradient,
                failed && 'opacity-40 grayscale'
              )}
              title={`${meta.label}${failed ? ' (failed)' : ''}`}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>
          );
        })}
      </div>

      {/* Always-visible account chip (first handle) */}
      {primaryHandle && (
        <div className="absolute bottom-1.5 right-1.5 max-w-[60%] px-1.5 py-0.5 rounded-md bg-black/45 backdrop-blur-sm text-white text-[10px] font-medium truncate pointer-events-none">
          @{primaryHandle}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
        <p className="text-white text-[11px] sm:text-xs line-clamp-3 mb-1.5 leading-snug">
          {post.content || <span className="italic text-white/70">(no caption)</span>}
        </p>

        {/* Account handles */}
        {accountLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {accountLabels.slice(0, 3).map((a, i) => {
              const Icon = a.platform ? PLATFORM_META[a.platform].icon : null;
              return (
                <span
                  key={`${a.platform ?? 'x'}-${a.handle}-${i}`}
                  className="inline-flex items-center gap-1 text-[10px] text-white bg-white/15 backdrop-blur-sm rounded-md px-1.5 py-0.5"
                >
                  {Icon && <Icon className="w-2.5 h-2.5" />}
                  <span className="truncate max-w-[90px]">@{a.handle}</span>
                </span>
              );
            })}
            {accountLabels.length > 3 && (
              <span className="text-[10px] text-white/70">+{accountLabels.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/80 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeLabel}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-6 h-6 rounded-md bg-white/15 hover:bg-red-500/90 text-white flex items-center justify-center transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Status helpers (shared) ─────────────────────────── */

const statusPillFor = (post: Post) => {
  if (isDraftPost(post)) {
    return { label: 'Draft', cls: 'text-slate-700 bg-slate-100 border border-slate-300', Icon: FileText };
  }
  if (post.status === 'published' || post.status === 'posted') {
    return { label: 'Published', cls: 'text-emerald-700 bg-emerald-50 border border-emerald-200', Icon: CheckCircle2 };
  }
  if (post.status === 'partial') {
    return { label: 'Partial', cls: 'text-amber-700 bg-amber-50 border border-amber-200', Icon: AlertTriangle };
  }
  if (post.status === 'failed') {
    return { label: 'Failed', cls: 'text-red-700 bg-red-50 border border-red-200', Icon: XCircle };
  }
  if (post.status === 'pending' || post.status === 'processing') {
    return { label: 'Processing', cls: 'text-blue-700 bg-blue-50 border border-blue-200', Icon: Loader2 };
  }
  return { label: post.status, cls: 'text-slate-700 bg-slate-50 border border-slate-200', Icon: Clock };
};

const firstHandle = (post: Post): string =>
  post.target_account_details?.[0]?.platform_username ||
  post.target_account_details?.[0]?.display_name ||
  '';

/* ─────────────────────────── List row ─────────────────────────── */

interface RowProps {
  post: Post;
  activePlatform: Platform | null;
  onClick: () => void;
  onDelete: () => void;
}

const PostListRow = ({ post, onClick, onDelete }: RowProps) => {
  const image = getFirstImage(post);
  const video = getVideoSrc(post);
  const status = statusPillFor(post);
  const StatusIcon = status.Icon;
  const handle = firstHandle(post);
  const time = post.published_at || post.created_at;
  const draft = isDraftPost(post);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200">
        {image ? (
          <AuthImage src={image} alt="" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
        ) : video ? (
          <div className="relative w-full h-full">
            <video src={video} preload="metadata" muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="w-4 h-4 text-white/80" fill="currentColor" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate leading-tight">
          {post.content?.trim() || <span className="italic text-slate-400">(no caption)</span>}
        </p>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full', status.cls)}>
            <StatusIcon className={cn('w-3 h-3', (post.status === 'pending' || post.status === 'processing') && 'animate-spin')} />
            {status.label}
          </span>
          <div className="flex items-center gap-0.5">
            {post.platforms.map((p) => {
              const Icon = PLATFORM_META[p].icon;
              return <Icon key={p} className="w-3 h-3 text-slate-400" />;
            })}
          </div>
          {handle && <span className="text-[11px] text-slate-500 truncate">@{handle}</span>}
          {time && (
            <span className="ml-auto text-[11px] text-slate-500 tabular-nums">
              {new Date(time).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          title={draft ? 'Edit draft' : 'View'}
        >
          {draft ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

/* ─────────────────────────── Detailed card ─────────────────────────── */

const PostDetailCard = ({ post, activePlatform, onClick, onDelete }: RowProps) => {
  const image = getFirstImage(post);
  const video = getVideoSrc(post);
  const imageCount = (post.images?.length ?? 0) + (post.image ? 1 : 0);
  const status = statusPillFor(post);
  const StatusIcon = status.Icon;
  const time = post.published_at || post.created_at;
  const draft = isDraftPost(post);

  // Per-platform results we care about for the current tab (or all).
  const resultEntries = Object.entries(post.platform_results ?? {})
    .map(([key, r]) => {
      // Try to resolve platform either directly from key or via r.platform
      const platform = (post.platforms.includes(key as Platform)
        ? (key as Platform)
        : (r.platform as Platform | undefined)) ?? null;
      return { key, platform, result: r };
    })
    .filter((x) => !activePlatform || x.platform === activePlatform);

  return (
    <div
      onClick={onClick}
      className="grid md:grid-cols-[200px_1fr] gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      {/* Media */}
      <div className="relative aspect-square md:aspect-auto md:h-full rounded-xl overflow-hidden bg-slate-100">
        {image ? (
          <AuthImage src={image} alt="" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
       ) : video ? (
          <div className="relative w-full h-full">
            <video src={video} preload="metadata" muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="w-10 h-10 text-white/80" fill="currentColor" />
            </div>
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

      {/* Details */}
      <div className="min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full', status.cls)}>
            <StatusIcon className={cn('w-3 h-3', (post.status === 'pending' || post.status === 'processing') && 'animate-spin')} />
            {status.label}
          </span>
          {post.platforms.map((p) => {
            const meta = PLATFORM_META[p];
            const Icon = meta.icon;
            return (
              <span
                key={p}
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] font-medium text-white bg-gradient-to-br px-2 py-0.5 rounded-full shadow-sm',
                  meta.gradient
                )}
              >
                <Icon className="w-2.5 h-2.5" />
                {meta.label}
              </span>
            );
          })}
          {time && (
            <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(time).toLocaleString()}
            </span>
          )}
        </div>

        {/* Account handles */}
        {post.target_account_details && post.target_account_details.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.target_account_details
              .filter((a) => !activePlatform || a.platform === activePlatform)
              .map((acc) => {
                const Icon = PLATFORM_META[acc.platform]?.icon;
                const handle = acc.platform_username || acc.display_name || '';
                return (
                  <span
                    key={acc.id}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full"
                  >
                    {Icon && <Icon className="w-3 h-3 text-slate-500" />}
                    @{handle}
                  </span>
                );
              })}
          </div>
        )}

        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
          {post.content?.trim() || <span className="italic text-slate-400">(no caption)</span>}
        </p>

        {/* Per-platform results */}
        {resultEntries.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-1.5 mt-1">
            {resultEntries.map(({ key, platform, result }) => {
              const meta = platform ? PLATFORM_META[platform] : null;
              const Icon = meta?.icon;
              const success = Boolean(result.success);
              return (
                <div
                  key={key}
                  className={cn(
                    'flex items-center gap-2 text-[11px] rounded-lg border px-2 py-1',
                    success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  )}
                >
                  {Icon && <Icon className="w-3 h-3 shrink-0" />}
                  <span className="font-medium capitalize">{meta?.label ?? platform ?? key}</span>
                  {success ? (
                    <CheckCircle2 className="w-3 h-3 ml-auto shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 ml-auto shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'rounded-full h-8',
              draft
                ? 'border-blue-300 text-blue-700 hover:bg-blue-50'
                : 'border-slate-300'
            )}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            {draft ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {draft ? 'Edit draft' : 'View details'}
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

export default Posts;

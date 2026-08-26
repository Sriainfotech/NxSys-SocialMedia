import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { resolveMediaUrl, type Post, type PostStatus, type Platform } from '@/stores/postStore';
import { useAccountStore } from '@/stores/accountStore';
import {
  Twitter, Linkedin, Facebook, Instagram, Youtube,
  CheckCircle2, XCircle, Clock, Calendar, Loader,
  ExternalLink, Hash, FileText, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AuthImage from '@/components/AuthImage';
import { useAuthenticatedSrc } from '@/hooks/useAuthenticatedSrc';

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

// <video> counterpart to AuthImage — uses the same fetch-through-axios trick
// so ngrok-hosted clips play without the browser warning page.
const AuthVideo = ({ src }: { src: string }) => {
  const resolved = useAuthenticatedSrc(src);
  if (!resolved) {
    return (
      <div className="w-full aspect-video rounded-md border bg-muted animate-pulse" aria-hidden />
    );
  }
  return (
    <video
      src={resolved}
      className="w-full aspect-video object-cover rounded-md border bg-muted"
      controls
    />
  );
};

const PLATFORM_COLORS: Record<Platform, string> = {
  twitter: 'bg-[hsl(203,89%,53%)]',
  linkedin: 'bg-[hsl(210,80%,42%)]',
  facebook: 'bg-[hsl(221,44%,41%)]',
  instagram: 'bg-[hsl(340,75%,54%)]',
  youtube: 'bg-[hsl(0,100%,50%)]',
};

const STATUS_STYLES: Record<PostStatus, { label: string; icon: React.ElementType; className: string }> = {
  scheduled: { label: 'Scheduled', icon: Clock, className: 'bg-amber-100 text-amber-700' },
  queued: { label: 'Queued', icon: Clock, className: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Pending', icon: Loader, className: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Processing', icon: Loader, className: 'bg-blue-100 text-blue-700' },
  published: { label: 'Published', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700' },
  posted: { label: 'Posted', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Partially Published', icon: AlertTriangle, className: 'bg-orange-100 text-orange-700' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-red-100 text-red-700' },
  draft: { label: 'Draft', icon: FileText, className: 'bg-slate-100 text-slate-700' },
};

const buildPostLink = (platform: string, result: any): string | null => {
  if (!result) return null;
  if (platform === 'linkedin' && result.post_urn) {
    const id = String(result.post_urn).split(':').pop();
    return id ? `https://www.linkedin.com/feed/update/${result.post_urn}` : null;
  }
  if (platform === 'facebook' && result.post_id) {
    const [pageId, postId] = String(result.post_id).split('_');
    if (pageId && postId) return `https://www.facebook.com/${pageId}/posts/${postId}`;
  }
  if (platform === 'twitter' && result.post_id) {
    return `https://twitter.com/i/web/status/${result.post_id}`;
  }
  if (platform === 'youtube' && result.post_id) {
    return `https://www.youtube.com/watch?v=${result.post_id}`;
  }
  return null;
};

interface PostDetailsProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDetails = ({ post, open, onOpenChange }: PostDetailsProps) => {
  const accounts = useAccountStore((s) => s.accounts);

  if (!post) return null;

  // Resolve a platform_results key (may be a platform name like "linkedin" or an
  // account id like "22") into { platform, label } so we can render the right icon.
  const resolveResultKey = (key: string): { platform: Platform | null; label: string } => {
    // Numeric → treat as account id and look up
    if (/^\d+$/.test(key)) {
      const acc = accounts.find((a) => String(a.id) === key);
      if (acc) {
        const handle = acc.username || acc.platform_username;
        return { platform: acc.platform, label: handle ? `${acc.platform} · ${handle}` : acc.platform };
      }
      return { platform: null, label: `Account #${key}` };
    }
    // String → assume platform name
    if ((['twitter', 'linkedin', 'facebook', 'instagram', 'youtube'] as const).includes(key as Platform)) {
      return { platform: key as Platform, label: key };
    }
    return { platform: null, label: key };
  };

  const statusCfg = STATUS_STYLES[post.status] || STATUS_STYLES.pending;
  const StatusIcon = statusCfg.icon;
  const hasLoader = post.status === 'processing' || post.status === 'pending';

  // Collect all media
  const images: string[] = [];
  if (post.images && post.images.length > 0) images.push(...post.images);
  else if (post.image) images.push(post.image);
  if (post.media_file) images.push(post.media_file);
  const videoSrc = post.video || post.video_file;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/30">
              <Hash className="w-4 h-4 text-white" />
            </div>
            Post #{post.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full', statusCfg.className)}>
              <StatusIcon className={cn('w-3.5 h-3.5', hasLoader && 'animate-spin')} />
              {statusCfg.label}
            </span>
            <div className="flex items-center gap-1.5">
              {post.platforms.map((p) => {
                const Icon = PLATFORM_ICONS[p];
                const result = post.platform_results?.[p];
                const color = result?.success ? 'bg-emerald-500' :
                              result?.error ? 'bg-red-500' :
                              PLATFORM_COLORS[p];
                return (
                  <div key={p} className={cn('w-7 h-7 rounded-md flex items-center justify-center', color)} title={p}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Content</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
            </div>
          </div>

          {/* Media */}
          {(images.length > 0 || videoSrc) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Media {images.length > 0 && `(${images.length} ${images.length === 1 ? 'image' : 'images'})`}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {videoSrc && (
                  <div className="col-span-3 max-w-md">
                    <AuthVideo src={resolveMediaUrl(videoSrc)} />
                  </div>
                )}
                {images.map((src, i) => {
                  const resolved = resolveMediaUrl(src);
                  return (
                    <a
                      key={i}
                      href={resolved}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group relative"
                    >
                      <AuthImage
                        src={resolved}
                        alt={`Post media ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-md border bg-muted group-hover:opacity-90 transition"
                        wrapperClassName="w-full aspect-square rounded-md border bg-muted"
                      />
                    </a>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Click an image to open full-size in a new tab.</p>
            </div>
          )}

          {/* Platform options */}
          {post.platform_options && Object.keys(post.platform_options).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Platform options</h3>
              <div className="space-y-1.5">
                {Object.entries(post.platform_options).map(([key, opts]) => {
                  const { label } = resolveResultKey(key);
                  return (
                    <div key={key} className="text-xs flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{label}</Badge>
                      <span className="text-muted-foreground">
                        {Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Platform results */}
          {post.platform_results && Object.keys(post.platform_results).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Per-platform results</h3>
              <div className="space-y-2">
                {Object.entries(post.platform_results).map(([key, result]) => {
                  const { platform, label } = resolveResultKey(key);
                  const Icon = platform ? PLATFORM_ICONS[platform] : null;
                  const success = result.success;
                  const link = platform ? buildPostLink(platform, result) : null;
                  return (
                    <div
                      key={key}
                      className={cn(
                        'rounded-lg border p-3',
                        success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {Icon && <Icon className="w-4 h-4" />}
                        <span className="font-medium text-sm capitalize">{label}</span>
                        {success ? (
                          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Success</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {result.post_urn && (
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          URN: {result.post_urn}
                        </p>
                      )}
                      {result.post_id && (
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          ID: {result.post_id}
                        </p>
                      )}
                      {result.error && (
                        <p className="text-xs text-red-700 mt-1 break-words">
                          {result.error}
                        </p>
                      )}
                      {result.processed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Processed: {new Date(result.processed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Timeline</h3>
            <div className="space-y-1.5 text-sm">
              {post.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
              )}
              {post.scheduled_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span>{new Date(post.scheduled_time).toLocaleString()}</span>
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Published:</span>
                  <span>{new Date(post.published_at).toLocaleString()}</span>
                </div>
              )}
              {post.updated_at && post.updated_at !== post.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{new Date(post.updated_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {post.celery_task_id && (
            <div className="text-xs text-muted-foreground font-mono break-all">
              Task ID: {post.celery_task_id}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetails;

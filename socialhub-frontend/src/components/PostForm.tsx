import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePostStore, resolveMediaUrl, type Platform, type InstagramPostType, type Post } from '@/stores/postStore';
import { useAccountStore } from '@/stores/accountStore';
import { useBillingStore } from '@/stores/billingStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Loader2, Image, Twitter, Linkedin, Facebook, Instagram, Youtube,
  AlertCircle, CheckCircle2, ArrowLeft, Upload, X, Plus, Video,
  ChevronDown, Zap, Sparkles, FileText, Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORM_LIMITS: Record<Platform, { maxChars: number; mediaRequired: boolean; label: string }> = {
  twitter: { maxChars: 280, mediaRequired: false, label: 'Twitter' },
  linkedin: { maxChars: 3000, mediaRequired: false, label: 'LinkedIn' },
  facebook: { maxChars: 63206, mediaRequired: false, label: 'Facebook' },
  instagram: { maxChars: 2200, mediaRequired: true, label: 'Instagram' },
  youtube: { maxChars: 5000, mediaRequired: true, label: 'YouTube' },
};

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  twitter: Twitter, linkedin: Linkedin, facebook: Facebook, instagram: Instagram, youtube: Youtube,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  twitter: 'bg-[hsl(203,89%,53%)]',
  linkedin: 'bg-[hsl(210,80%,42%)]',
  facebook: 'bg-[hsl(221,44%,41%)]',
  instagram: 'bg-[hsl(340,75%,54%)]',
  youtube: 'bg-[hsl(0,100%,50%)]',
};

const INSTAGRAM_POST_TYPES: { value: InstagramPostType; label: string; description: string }[] = [
  { value: 'feed', label: 'Feed Post', description: 'Appears on your profile and followers\' feeds' },
  { value: 'reel', label: 'Reel', description: 'Short video · requires a public video URL' },
  { value: 'story', label: 'Story', description: 'Disappears after 24 hours · image or video' },
];

export type PostMode = 'post' | 'queue' | 'schedule' | 'draft';
type MediaTab = 'images' | 'video';

interface PostFormProps {
  mode?: PostMode;
  /** When present, the form opens pre-filled and submits as an UPDATE. */
  editingPost?: Post | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_IMAGES = 9;
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/webm', 'video/x-m4v'];
const MAX_VIDEO_SIZE_GB = 5;

const PostForm = ({ mode = 'post', editingPost, onSuccess, onCancel }: PostFormProps) => {
  const isEditing = Boolean(editingPost);
  const [content, setContent] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);

  // Instagram-specific post type (global, applied to every selected IG account)
  const [instagramPostType, setInstagramPostType] = useState<InstagramPostType>('feed');
  const [showIgTypeDropdown, setShowIgTypeDropdown] = useState(false);

  // Media tab
  const [mediaTab, setMediaTab] = useState<MediaTab>('images');

  // Images
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Video
  const [videoTab, setVideoTab] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [scheduledAt, setScheduledAt] = useState('');
  // Overrides keyed by account id as string
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [useOverrides, setUseOverrides] = useState(false);

  const { createPost, isCreating, uploadProgress } = usePostStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { usage, fetchUsage } = useBillingStore();

  useEffect(() => {
    fetchAccounts().catch(() => {});
    fetchUsage().catch(() => {});
  }, [fetchAccounts, fetchUsage]);

  // ── Pre-fill when editing an existing post (draft, scheduled, etc.) ──
  useEffect(() => {
    if (!editingPost) return;
    setContent(editingPost.content || '');

    // target_accounts is the source of truth for which accounts to pre-select
    if (Array.isArray(editingPost.target_accounts)) {
      setSelectedAccountIds(editingPost.target_accounts);
    } else if (editingPost.target_account_details) {
      setSelectedAccountIds(editingPost.target_account_details.map((a) => a.id));
    }

    // Images — resolve relative backend paths to absolute URLs so preview works
    const rawImages: string[] = [];
    if (editingPost.images && editingPost.images.length > 0) rawImages.push(...editingPost.images);
    else if (editingPost.image) rawImages.push(editingPost.image);
    if (editingPost.media_file) rawImages.push(editingPost.media_file);
    if (rawImages.length > 0) {
      setImageUrls(rawImages.map((u) => resolveMediaUrl(u)));
      setImageTab('url');
      setMediaTab('images');
    }

    // Video
    if (editingPost.video) {
      setVideoUrl(resolveMediaUrl(editingPost.video));
      setVideoTab('url');
      setMediaTab('video');
    } else if (editingPost.video_file) {
      setVideoUrl(resolveMediaUrl(editingPost.video_file));
      setVideoTab('url');
      setMediaTab('video');
    }

    // Scheduled time — convert ISO to the "YYYY-MM-DDTHH:mm" datetime-local format
    if (editingPost.scheduled_time) {
      const d = new Date(editingPost.scheduled_time);
      if (!Number.isNaN(d.getTime())) {
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        setScheduledAt(local.toISOString().slice(0, 16));
      }
    }

    // Per-account content overrides
    if (editingPost.content_overrides && Object.keys(editingPost.content_overrides).length > 0) {
      setOverrides(editingPost.content_overrides);
      setUseOverrides(true);
    }

    // Instagram post type — pick the first one we find in platform_options
    if (editingPost.platform_options) {
      const ig = Object.values(editingPost.platform_options).find((opts) => opts?.post_type);
      const pt = ig?.post_type;
      if (pt === 'feed' || pt === 'reel' || pt === 'story') {
        setInstagramPostType(pt);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPost?.id]);

  const selectedAccounts = useMemo(
    () => accounts.filter((a) => a.id != null && selectedAccountIds.includes(a.id!)),
    [accounts, selectedAccountIds]
  );
  const selectedPlatformSet = useMemo(
    () => new Set<Platform>(selectedAccounts.map((a) => a.platform)),
    [selectedAccounts]
  );
  const igSelected = selectedPlatformSet.has('instagram');

  // Auto-switch media tab when Instagram post type changes
  useEffect(() => {
    if (igSelected && instagramPostType === 'reel') {
      setMediaTab('video');
      clearImages();
    }
  }, [instagramPostType, igSelected]);

  const toggleAccount = (accountId: number) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const validUrls = imageUrls.filter(
    (u) => u.trim() && (u.startsWith('http://') || u.startsWith('https://'))
  );
  const totalImages = validUrls.length + imageFiles.length;
  const hasImage = totalImages > 0;
  const hasVideo = Boolean(videoUrl.trim() || videoFile);
  const hasMedia = hasImage || hasVideo;

  // Validation — errors keyed by account id (string)
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    selectedAccounts.forEach((a) => {
      const p = a.platform;
      const limits = PLATFORM_LIMITS[p];
      const key = String(a.id);
      const override = useOverrides ? overrides[key] : undefined;
      const effectiveContent = override && override.trim() ? override : content;
      if (effectiveContent.length > limits.maxChars) {
        errors[key] = `Exceeds ${limits.maxChars} characters`;
        return;
      }
      if (p === 'instagram') {
        if (instagramPostType === 'reel' && !hasVideo) {
          errors[key] = 'Reels require a video URL';
        } else if (instagramPostType === 'story' && !hasMedia) {
          errors[key] = 'Stories require an image or video';
        } else if (instagramPostType === 'feed' && !hasMedia) {
          errors[key] = 'Feed posts require an image';
        }
      } else if (limits.mediaRequired && !hasMedia) {
        errors[key] = 'Image or video is required';
      }
    });
    return errors;
  }, [content, selectedAccounts, hasMedia, hasVideo, overrides, useOverrides, instagramPostType]);

  // ── Image handlers ────────────────────────────────────────────────────
  const updateUrl = (index: number, value: string) =>
    setImageUrls((prev) => prev.map((u, i) => (i === index ? value : u)));

  const addUrlField = () => {
    if (totalImages < MAX_IMAGES) setImageUrls((prev) => [...prev, '']);
  };

  const removeUrl = (index: number) =>
    setImageUrls((prev) => prev.filter((_, i) => i !== index));

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const toAdd = selected.slice(0, MAX_IMAGES - totalImages);
    if (toAdd.some((f) => !f.type.startsWith('image/'))) {
      toast.error('Only image files allowed'); return;
    }
    if (toAdd.some((f) => f.size > 10 * 1024 * 1024)) {
      toast.error('Each image must be under 10MB'); return;
    }
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    setImageFiles((prev) => [...prev, ...toAdd]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImageUrls(['']); setImageFiles([]); setFilePreviews([]);
  };

  // ── Video handlers ────────────────────────────────────────────────────
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Unsupported video format. Use MP4, MOV, AVI, MKV, or WebM.');
      return;
    }
    const maxBytes = MAX_VIDEO_SIZE_GB * 1024 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Video must be under ${MAX_VIDEO_SIZE_GB}GB`);
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview('');
    setVideoUrl('');
  };

  // ── Credit awareness ──────────────────────────────────────────────────
  // Backend quota is posts_per_month — one post = one credit, regardless of
  // how many networks it fans out to. Drafts and queuing are free (no debit).
  const creditCost = mode === 'draft' || selectedAccountIds.length === 0 ? 0 : 1;
  const creditsRemaining = Number(usage?.credits_remaining ?? 0);
  const creditsTotal = Number(usage?.credits_total ?? 0);
  const hasCreditInfo = creditsTotal > 0;
  const insufficientCredits =
    mode !== 'draft' && hasCreditInfo && creditCost > 0 && creditCost > creditsRemaining;

  // ── Submit ────────────────────────────────────────────────────────────
  const canSubmit =
    (content.trim() || hasMedia) &&
    selectedAccountIds.length > 0 &&
    Object.keys(validationErrors).length === 0 &&
    (mode !== 'schedule' || scheduledAt) &&
    !insufficientCredits;

  const isUploading = isCreating && (videoFile != null || imageFiles.length > 0) && uploadProgress < 100;

  const buttonLabel: Record<PostMode, string> = isEditing
    ? {
        post: 'Publish Update',
        queue: 'Update Queue Entry',
        schedule: 'Update Schedule',
        draft: 'Save Draft',
      }
    : {
        post: 'Post Now',
        queue: 'Add to Queue',
        schedule: 'Schedule Post',
        draft: 'Save as Draft',
      };
  const titleLabel: Record<PostMode, string> = isEditing
    ? {
        post: 'Edit Post',
        queue: 'Edit Queued Post',
        schedule: 'Edit Scheduled Post',
        draft: 'Edit Draft',
      }
    : {
        post: 'Create Post',
        queue: 'Add to Queue',
        schedule: 'Schedule Post',
        draft: 'Save Draft',
      };

  const handleSubmit = async (override?: PostMode) => {
    const effectiveMode: PostMode = override ?? mode;

    // Minimal validation that isn't mode-specific.
    const baseValid =
      (content.trim() || hasMedia) &&
      selectedAccountIds.length > 0 &&
      Object.keys(validationErrors).length === 0 &&
      !insufficientCredits;
    if (!baseValid) return;
    // Schedule requires a date regardless of where the click came from.
    if (effectiveMode === 'schedule' && !scheduledAt) {
      toast.error('Pick a scheduled time first.');
      return;
    }

    // Validate video URL is direct link
    if (hasVideo && videoUrl.trim()) {
      const lower = videoUrl.toLowerCase();
      if (lower.includes('youtu.be') || lower.includes('youtube.com') || lower.includes('vimeo.com')) {
        toast.error('YouTube and Vimeo links are not supported. Use a direct .mp4 URL.');
        return;
      }
    }

    try {
      const targetAccounts = selectedAccounts.map((a) => a.id!) as number[];

      if (targetAccounts.length === 0) {
        toast.error('Select at least one connected account.');
        return;
      }

      // Per-account content overrides (keyed by account id as string)
      const contentOverrides: Record<string, string> = {};
      if (useOverrides) {
        selectedAccounts.forEach((a) => {
          const override = overrides[String(a.id)];
          if (override && override.trim()) contentOverrides[String(a.id)] = override;
        });
      }

      // Per-account platform options (keyed by account id as string)
      const platformOptions: Record<string, Record<string, string>> = {};
      selectedAccounts.forEach((a) => {
        if (a.platform === 'instagram') {
          platformOptions[String(a.id)] = { post_type: instagramPostType };
        }
      });

      await createPost({
        content,
        targetAccounts,
        media: validUrls,
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
        videoFile: videoFile || undefined,
        videoUrl: videoUrl.trim() || undefined,
        platformOptions: Object.keys(platformOptions).length > 0 ? platformOptions : undefined,
        scheduledAt:
          effectiveMode === 'schedule' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        isDraft: effectiveMode === 'draft',
        addToQueue: effectiveMode === 'queue',
        contentOverrides: Object.keys(contentOverrides).length > 0 ? contentOverrides : undefined,
        editingId: editingPost?.id,
      });

      const successMsg: Record<PostMode, string> = isEditing
        ? {
            post: hasVideo ? 'Video uploading — post will publish once processed.' : 'Draft published!',
            queue: 'Queue entry updated!',
            schedule: 'Schedule updated!',
            draft: 'Draft saved!',
          }
        : {
            post: hasVideo ? 'Video uploading — post will publish once processed.' : 'Post published!',
            queue: 'Added to queue!',
            schedule: 'Post scheduled!',
            draft: 'Draft saved!',
          };
      toast.success(successMsg[effectiveMode]);

      setContent(''); setSelectedAccountIds([]);
      setImageUrls(['']); setImageFiles([]); setFilePreviews([]);
      clearVideo();
      setScheduledAt(''); setOverrides({}); setUseOverrides(false);
      setInstagramPostType('feed');
      fetchUsage().catch(() => {});
      onSuccess?.();
    } catch (error) {
      toast.error(String(error ?? 'Something went wrong'));
    }
  };

  const allImagePreviews = [
    ...validUrls.map((u) => ({ src: u, type: 'url' as const })),
    ...filePreviews.map((p) => ({ src: p, type: 'file' as const })),
  ];

  const selectedIgType = INSTAGRAM_POST_TYPES.find((t) => t.value === instagramPostType)!;

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-9 w-9 rounded-lg shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">{titleLabel[mode]}</h2>
      </div>

      <div className="grid lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 space-y-3 min-w-0">

          {/* Content */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
            <Label className="mb-2 block text-slate-900">Content</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              disabled={isCreating}
              className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-3">
              <span className="text-xs text-slate-500">{content.length} chars</span>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-slate-900">Media</Label>
              <div className="inline-flex rounded-md border bg-muted p-0.5 text-xs">
                <button type="button"
                  onClick={() => { setMediaTab('images'); clearVideo(); }}
                  className={cn('flex items-center gap-1 px-3 py-1 rounded',
                    mediaTab === 'images' ? 'bg-background shadow' : 'text-muted-foreground')}>
                  <Image className="w-3 h-3" /> Images
                </button>
                <button type="button"
                  onClick={() => { setMediaTab('video'); clearImages(); }}
                  className={cn('flex items-center gap-1 px-3 py-1 rounded',
                    mediaTab === 'video' ? 'bg-background shadow' : 'text-muted-foreground')}>
                  <Video className="w-3 h-3" /> Video
                </button>
              </div>
            </div>

            {/* Images */}
            {mediaTab === 'images' && (
              <>
                <div className="inline-flex rounded-md border bg-muted p-0.5 text-xs mb-3">
                  <button type="button"
                    onClick={() => { setImageTab('url'); setImageFiles([]); setFilePreviews([]); }}
                    className={cn('px-3 py-1 rounded', imageTab === 'url' ? 'bg-background shadow' : 'text-muted-foreground')}>
                    URL
                  </button>
                  <button type="button"
                    onClick={() => { setImageTab('upload'); setImageUrls(['']); }}
                    className={cn('px-3 py-1 rounded', imageTab === 'upload' ? 'bg-background shadow' : 'text-muted-foreground')}>
                    Upload
                  </button>
                </div>

                {imageTab === 'url' ? (
                  <div className="space-y-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Image className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <Input placeholder="https://images.unsplash.com/..."
                          value={url} onChange={(e) => updateUrl(index, e.target.value)}
                          disabled={isCreating} className="flex-1" />
                        {imageUrls.length > 1 && (
                          <button type="button" onClick={() => removeUrl(index)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {totalImages < MAX_IMAGES && (
                      <button type="button" onClick={addUrlField} disabled={isCreating}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1">
                        <Plus className="w-3.5 h-3.5" /> Add another image URL
                      </button>
                    )}
                  </div>
                ) : (
                  <label htmlFor="imageFiles"
                    className={cn('flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                      isCreating || totalImages >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5')}>
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Click to upload images</span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB · {MAX_IMAGES - totalImages} slots remaining
                    </span>
                    <input id="imageFiles" type="file" accept="image/*" multiple
                      onChange={handleFilesSelect} disabled={isCreating || totalImages >= MAX_IMAGES}
                      className="hidden" />
                  </label>
                )}

                {allImagePreviews.length > 0 && (
                  <div className="mt-3">
                    <div className={cn('grid gap-2',
                      allImagePreviews.length === 1 ? 'grid-cols-1' :
                      allImagePreviews.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                      {allImagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                          <img src={preview.src} alt="" className="w-full h-full object-cover" />
                          <button type="button"
                            onClick={() => {
                              if (preview.type === 'url') {
                                const i = imageUrls.indexOf(preview.src);
                                if (i >= 0) removeUrl(i);
                              } else {
                                const i = filePreviews.indexOf(preview.src);
                                if (i >= 0) removeFile(i);
                              }
                            }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {allImagePreviews.length > 1 && (
                      <button type="button" onClick={clearImages}
                        className="mt-2 text-xs text-muted-foreground hover:text-destructive">
                        Clear all images
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Video */}
            {mediaTab === 'video' && (
              <>
                <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
                  LinkedIn: upload file (H.264 MP4, up to 5GB). Instagram Reels/Stories: public URL only.
                  Video and images cannot be combined.
                </div>
                <div className="inline-flex rounded-md border bg-muted p-0.5 text-xs mb-3">
                  <button type="button"
                    onClick={() => { setVideoTab('url'); clearVideo(); }}
                    className={cn('px-3 py-1 rounded', videoTab === 'url' ? 'bg-background shadow' : 'text-muted-foreground')}>
                    URL
                  </button>
                  <button type="button"
                    onClick={() => { setVideoTab('upload'); setVideoUrl(''); }}
                    className={cn('px-3 py-1 rounded', videoTab === 'upload' ? 'bg-background shadow' : 'text-muted-foreground')}>
                    Upload
                  </button>
                </div>

                {videoTab === 'url' ? (
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="https://example.com/video.mp4"
                      value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={isCreating} className="pl-9" />
                  </div>
                ) : (
                  <label htmlFor="videoFile"
                    className={cn('flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                      isCreating ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5')}>
                    <Video className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {videoFile ? videoFile.name : 'Click to upload a video'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      MP4, MOV, AVI, MKV, WebM · up to {MAX_VIDEO_SIZE_GB}GB · LinkedIn only
                    </span>
                    <input id="videoFile" type="file"
                      accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/x-m4v"
                      onChange={handleVideoFileSelect} disabled={isCreating} className="hidden" />
                  </label>
                )}

                {(videoPreview || videoUrl.trim()) && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border bg-muted">
                    <video src={videoPreview || videoUrl} controls
                      className="w-full max-h-48 object-contain" />
                    <button type="button" onClick={clearVideo}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {mediaTab === 'video' ? 'Uploading video…' : 'Uploading images…'}
                </span>
                <span className="text-xs text-slate-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }} />
              </div>
              {mediaTab === 'video' && (
                <p className="text-xs text-slate-500 mt-2">
                  Large videos may take a while. Don't close this tab.
                </p>
              )}
            </div>
          )}

          {/* Accounts */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-slate-900">Accounts</Label>
              <span className="text-xs text-slate-500">
                {selectedAccountIds.length} of {accounts.length} selected
              </span>
            </div>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No connected accounts. Connect one from the Accounts page first.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {accounts.map((account) => {
                  if (account.id == null) return null;
                  const Icon = PLATFORM_ICONS[account.platform];
                  const isSelected = selectedAccountIds.includes(account.id);
                  const error = validationErrors[String(account.id)];
                  return (
                    <button
                      key={account.id}
                      disabled={isCreating}
                      onClick={() => toggleAccount(account.id!)}
                      className={cn('flex items-center gap-3 p-3 rounded-xl border text-sm transition-all text-left bg-white',
                        isSelected
                          ? 'border-blue-400 bg-gradient-to-br from-blue-50/80 to-blue-50/60 ring-2 ring-blue-500/30 shadow-sm shadow-blue-500/10'
                          : 'border-slate-200 hover:border-blue-300 hover:-translate-y-0.5')}>
                      <div className={cn('w-8 h-8 rounded-md flex items-center justify-center shrink-0', PLATFORM_COLORS[account.platform])}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {account.username || account.platform_username || PLATFORM_LIMITS[account.platform].label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {error && isSelected
                            ? <span className="text-destructive">{error}</span>
                            : PLATFORM_LIMITS[account.platform].label}
                        </p>
                      </div>
                      {isSelected && !error && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      {error && isSelected && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Instagram post type — applied to every selected Instagram account */}
            {igSelected && (
              <div className="relative mt-3">
                <Label className="text-xs text-muted-foreground mb-1 block">Instagram post type</Label>
                <button
                  type="button"
                  onClick={() => setShowIgTypeDropdown(!showIgTypeDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-background hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-foreground">{selectedIgType.label}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform',
                    showIgTypeDropdown && 'rotate-180')} />
                </button>

                {showIgTypeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-background border rounded-md shadow-md overflow-hidden">
                    {INSTAGRAM_POST_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setInstagramPostType(type.value);
                          setShowIgTypeDropdown(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors',
                          instagramPostType === type.value && 'bg-primary/5 text-primary font-medium'
                        )}
                      >
                        <p className="font-medium">{type.label}</p>
                        <p className="text-muted-foreground mt-0.5">{type.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Per-account content overrides */}
          {selectedAccountIds.length > 0 && mode !== 'draft' && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-900">Per-account content</Label>
                <button type="button" onClick={() => setUseOverrides(!useOverrides)}
                  className={cn('text-xs px-3 py-1 rounded-full border transition-colors',
                    useOverrides
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-sm shadow-blue-500/30'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50')}>
                  {useOverrides ? 'On' : 'Off'}
                </button>
              </div>
              {useOverrides && (
                <div className="space-y-3">
                  {selectedAccounts.map((a) => {
                    const key = String(a.id);
                    const label = a.username || a.platform_username || PLATFORM_LIMITS[a.platform].label;
                    return (
                      <div key={key}>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          {PLATFORM_LIMITS[a.platform].label} · {label}
                          {a.platform === 'instagram' && ` (${selectedIgType.label})`}
                        </Label>
                        <textarea value={overrides[key] || ''}
                          onChange={(e) => setOverrides({ ...overrides, [key]: e.target.value })}
                          placeholder={`Custom text for ${label}`}
                          rows={2} disabled={isCreating}
                          className="w-full bg-background border rounded-md p-2 resize-none outline-none text-sm" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Schedule time */}
          {mode === 'schedule' && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
              <Label htmlFor="schedule" className="mb-2 block text-slate-900">Schedule Time</Label>
              <Input id="schedule" type="datetime-local" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} disabled={isCreating} />
            </div>
          )}

          {/* Credits summary */}
          {mode !== 'draft' && selectedAccountIds.length > 0 && (
            <div
              className={cn(
                'rounded-2xl border p-4 shadow-sm',
                insufficientCredits
                  ? 'bg-rose-50/80 border-rose-200'
                  : 'bg-white border-slate-200/70'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0',
                      insufficientCredits
                        ? 'bg-gradient-to-br from-rose-500 to-red-500'
                        : 'bg-gradient-to-br from-blue-600 to-blue-400'
                    )}
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Post cost
                    </p>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                      {creditCost} {creditCost === 1 ? 'post' : 'posts'}
                      {hasCreditInfo && (
                        <span className="ml-2 font-normal text-slate-500">
                          · {creditsRemaining.toLocaleString()} remaining
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {insufficientCredits ? (
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-95 text-white rounded-full"
                  >
                    <Link to="/dashboard/billing">
                      <Sparkles className="w-3.5 h-3.5" />
                      Upgrade
                    </Link>
                  </Button>
                ) : hasCreditInfo ? (
                  <Link
                    to="/dashboard/billing"
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Manage plan
                  </Link>
                ) : null}
              </div>
              {insufficientCredits && (
                <p className="mt-2 text-xs text-rose-800">
                  You're out of posts for this cycle. Upgrade to keep publishing.
                </p>
              )}
            </div>
          )}

          {/* Submit actions — when editing a draft, we expose both
              "Save draft" and "Publish now" so users can finish and ship
              without leaving the form. */}
          {isEditing && mode === 'draft' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => handleSubmit('draft')}
                disabled={!canSubmit || isCreating}
                variant="outline"
                className="h-12 text-sm font-semibold rounded-full border-slate-300"
              >
                {isCreating
                  ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>)
                  : (<><FileText className="w-4 h-4" /> Save draft</>)}
              </Button>
              <Button
                onClick={() => handleSubmit('post')}
                disabled={!canSubmit || isCreating}
                className="h-12 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-95 text-white shadow-lg shadow-blue-500/30"
              >
                {isCreating
                  ? (<><Loader2 className="w-4 h-4 animate-spin" />
                      {isUploading ? `Uploading ${uploadProgress}%` : 'Publishing…'}</>)
                  : (<><Send className="w-4 h-4" /> Publish now</>)}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleSubmit()}
              disabled={!canSubmit || isCreating}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-95 text-white rounded-full shadow-lg shadow-blue-500/30"
            >
              {isCreating
                ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isUploading ? `Uploading ${uploadProgress}%` : 'Processing…'}</>)
                : buttonLabel[mode]}
            </Button>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 space-y-3 min-w-0">
          <h3 className="font-semibold text-xs text-blue-600 uppercase tracking-widest">
            Account Previews
          </h3>
          {selectedAccounts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">Select accounts to see previews</p>
            </div>
          ) : (
            selectedAccounts.map((account) => {
              const key = String(account.id);
              const limits = PLATFORM_LIMITS[account.platform];
              const Icon = PLATFORM_ICONS[account.platform];
              const override = useOverrides ? overrides[key] : undefined;
              const previewContent = override && override.trim() ? override : content;
              const overLimit = previewContent.length > limits.maxChars;
              const accountLabel = account.username || account.platform_username || limits.label;
              return (
                <div key={key} className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('w-6 h-6 rounded flex items-center justify-center', PLATFORM_COLORS[account.platform])}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium block truncate">{accountLabel}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{limits.label}</span>
                    </div>
                    {account.platform === 'instagram' && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {selectedIgType.label}
                      </span>
                    )}
                    <span className={cn('text-xs tabular-nums',
                      overLimit ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                      {previewContent.length}/{limits.maxChars}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {previewContent || <span className="text-muted-foreground italic">Your content will appear here…</span>}
                  </p>
                  {mediaTab === 'images' && allImagePreviews.length > 0 && (
                    <div className={cn('mt-3 grid gap-1 rounded-md overflow-hidden',
                      allImagePreviews.length === 1 ? 'grid-cols-1' :
                      allImagePreviews.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                      {allImagePreviews.slice(0, 9).map((p, i) => (
                        <div key={i} className="aspect-square bg-muted overflow-hidden">
                          <img src={p.src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {mediaTab === 'video' && (videoPreview || videoUrl.trim()) && (
                    <div className="mt-3 rounded-md overflow-hidden bg-muted flex items-center justify-center h-24">
                      <Video className="w-8 h-8 text-muted-foreground" />
                      <span className="ml-2 text-xs text-muted-foreground">
                        {videoFile ? videoFile.name : 'Video URL'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PostForm;
import { create } from 'zustand';
import axiosInstance from '@/lib/axiosInstance';
import { fetchAllPages } from '@/lib/pagination';

export type Platform = 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'youtube';
export type PostStatus = 'scheduled' | 'published' | 'posted' | 'failed' | 'draft' | 'queued' | 'processing' | 'pending' | 'partial';
export type InstagramPostType = 'feed' | 'reel' | 'story';

export interface PlatformResult {
  success: boolean;
  response?: { id: string };
  post_urn?: string;
  post_id?: string;
  asset_urn?: string;
  video_status?: string;
  error?: string;
  processed_at?: string;
  // Some results include the account that posted — useful for showing the username.
  account_id?: string;
  display_name?: string;
  platform?: string;
  url?: string;
  privacy?: string;
}

export interface TargetAccountDetail {
  id: number;
  platform: Platform;
  display_name?: string;
  platform_username?: string;
}

export interface Post {
  id: number;
  user: number;
  content: string;
  image: string | null;
  images: string[];
  media_file: string | null;
  video: string | null;
  video_file: string | null;
  platform_options: Record<string, Record<string, string>>;
  platforms: Platform[];
  target_accounts?: number[];
  target_account_details?: TargetAccountDetail[];
  content_overrides?: Record<string, string>;
  status: PostStatus;
  scheduled_time: string | null;
  celery_task_id: string | null;
  platform_results: Record<string, PlatformResult>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Resolve /media/... paths from the backend into URLs the browser can load.
// In dev the Vite proxy serves /media → backend, so relative paths just work.
// In production prefix with the backend host.
// const FALLBACK_API_BASE = 'https://pseudopregnant-fatless-ila.ngrok-free.dev/api/api';
const FALLBACK_API_BASE = 'https://nxsocial.nxsys.in/api';
// const FALLBACK_API_BASE = 'http://192.168.0.114:8000/api';


export const resolveMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  if (import.meta.env.DEV) {
    // If the backend returns an absolute URL (e.g. ngrok or production host), 
    // extract just the path so it goes through the local Vite proxy to avoid CORS.
    try {
      if (/^https?:\/\//i.test(url)) {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
      }
    } catch (e) { }
    return url.startsWith('/') ? url : `/${url}`;
  }

  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = import.meta.env.VITE_API_URL || FALLBACK_API_BASE;
  const host = apiBase.replace(/\/api\/?$/, '');
  return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Weekly posting-schedule slot returned by GET /scheduling/
export interface SchedulingSlot {
  id: number;
  day_of_week: number;        // backend index (0 = Monday per the sample payload)
  day_of_week_display?: string; // e.g. "Monday"
  time: string;                // "HH:MM:SS"
}

export interface CreatePostInput {
  content: string;
  // When set, the existing post is UPDATED via PUT /posts/{editingId}/
  // instead of creating a new one. Used for draft editing.
  editingId?: number;
  // Account IDs the post should go to
  targetAccounts: number[];
  // Images
  media?: string[];
  imageFiles?: File[];
  // Video
  videoUrl?: string;
  videoFile?: File;
  // Per-account options, keyed by account id as string e.g. {"3": {"post_type": "reel"}}
  platformOptions?: Record<string, Record<string, string>>;
  // Per-account content overrides, keyed by account id as string
  contentOverrides?: Record<string, string>;
  // Options
  scheduledAt?: string;
  isDraft?: boolean;
  addToQueue?: boolean;
}

export interface SchedulingSlotInput {
  day_of_week: number;
  time: string; // "HH:MM" or "HH:MM:SS"
}

interface PostState {
  posts: Post[];
  scheduledPosts: Post[];
  schedulingSlots: SchedulingSlot[];
  isCreating: boolean;
  isLoading: boolean;
  uploadProgress: number;
  isLoadingScheduled: boolean;
  fetchPosts: () => Promise<void>;
  fetchScheduledPosts: () => Promise<void>;
  createPost: (post: CreatePostInput) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  deleteAccountPost: (id: number, accountId: number) => Promise<void>;
  deleteScheduledPost: (id: number) => Promise<void>;
  createSchedulingSlot: (data: SchedulingSlotInput) => Promise<void>;
  updateSchedulingSlot: (id: number, data: SchedulingSlotInput) => Promise<void>;
  deleteSchedulingSlot: (id: number) => Promise<void>;
  updatePost: (id: number, data: Partial<CreatePostInput>) => Promise<void>;
  fetchDashboard: () => Promise<any>;
}

const extractError = (error: any, fallback: string) =>
  error.response?.data?.error ||
  error.response?.data?.detail ||
  error.response?.data?.message ||
  (error.response?.data ? Object.values(error.response.data).flat().join(' ') : fallback);

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  scheduledPosts: [],
  schedulingSlots: [],
  isCreating: false,
  isLoading: false,
  uploadProgress: 0,
  isLoadingScheduled: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const posts = await fetchAllPages<Post>(axiosInstance, '/posts/', { page_size: 100 });
      set({ posts, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw extractError(error, 'Failed to fetch posts');
    }
  },

  fetchScheduledPosts: async () => {
    set({ isLoadingScheduled: true });
    try {
      const { data } = await axiosInstance.get('/scheduling/');
      // New response shape: { slots: [...], scheduled_posts: [...] }
      // Fall back to older shapes if the backend evolves.
      if (data && typeof data === 'object' && ('scheduled_posts' in data || 'slots' in data)) {
        set({
          scheduledPosts: Array.isArray(data.scheduled_posts) ? data.scheduled_posts : [],
          schedulingSlots: Array.isArray(data.slots) ? data.slots : [],
          isLoadingScheduled: false,
        });
      } else {
        set({
          scheduledPosts: Array.isArray(data) ? data : data?.results || [],
          schedulingSlots: [],
          isLoadingScheduled: false,
        });
      }
    } catch (error: any) {
      set({ isLoadingScheduled: false });
      throw extractError(error, 'Failed to fetch scheduled posts');
    }
  },

  createPost: async (post) => {
    set({ isCreating: true, uploadProgress: 0 });
    try {
      const hasVideoFile = Boolean(post.videoFile);
      const hasImageFiles = post.imageFiles && post.imageFiles.length > 0;
      const urlImages = (post.media || []).filter(Boolean);

      // Use multipart whenever binary files are present
      const isMultipart = hasVideoFile || hasImageFiles;

      let responseData: any;

      if (isMultipart) {
        const form = new FormData();
        form.append('content', post.content);
        post.targetAccounts.forEach((id) => {
          form.append('target_accounts', id.toString());
        });

        if (hasVideoFile) form.append('video_file', post.videoFile!);

        urlImages.forEach((url) => {
          form.append('media_files', url);
          form.append('images', url);
          form.append('image', url);
        });
        if (hasImageFiles) {
          post.imageFiles!.forEach((file) => {
            form.append('media_files', file);
            form.append('images', file);
          });
        }

        if (post.platformOptions && Object.keys(post.platformOptions).length > 0) {
          form.append('platform_options', JSON.stringify(post.platformOptions));
        }
        if (post.scheduledAt) form.append('scheduled_time', post.scheduledAt);
        if (post.isDraft) form.append('is_draft', 'true');
        if (post.addToQueue) form.append('add_to_queue', 'true');
        if (post.contentOverrides && Object.keys(post.contentOverrides).length > 0) {
          form.append('content_overrides', JSON.stringify(post.contentOverrides));
        }

        const url = post.editingId ? `/posts/${post.editingId}/` : '/posts/';

        const axiosConfig = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (e: any) => {
            const pct = Math.round(((e.loaded || 0) * 100) / (e.total || 1));
            set({ uploadProgress: pct });
          },
        };

        const response = post.editingId
          ? await axiosInstance.put(url, form, axiosConfig)
          : await axiosInstance.post(url, form, axiosConfig);

        responseData = response.data;
      } else {
        const payload: any = {
          content: post.content,
          target_accounts: post.targetAccounts,
        };
        if (urlImages.length > 0) payload.images = urlImages;
        if (post.videoUrl) payload.video = post.videoUrl;
        if (post.platformOptions && Object.keys(post.platformOptions).length > 0) {
          payload.platform_options = post.platformOptions;
        }
        if (post.scheduledAt) payload.scheduled_time = post.scheduledAt;
        if (post.isDraft) payload.is_draft = true;
        if (post.addToQueue) payload.add_to_queue = true;
        if (post.contentOverrides && Object.keys(post.contentOverrides).length > 0) {
          payload.content_overrides = post.contentOverrides;
        }
        const url = post.editingId ? `/posts/${post.editingId}/` : '/posts/';
        const response = post.editingId
          ? await axiosInstance.put(url, payload)
          : await axiosInstance.post(url, payload);
        responseData = response.data;
      }

      set({ uploadProgress: 100 });

      if (post.editingId) {
        // Editing an existing post — replace it wherever it lived.
        set((state) => ({
          posts: state.posts.map((p) => (p.id === post.editingId ? responseData : p)),
          scheduledPosts: state.scheduledPosts.map((p) =>
            p.id === post.editingId ? responseData : p
          ),
          isCreating: false,
        }));
      } else if (post.isDraft) {
        set((state) => ({ posts: [responseData, ...state.posts], isCreating: false }));
      } else if (post.addToQueue || post.scheduledAt) {
        set((state) => ({
          scheduledPosts: [responseData, ...state.scheduledPosts],
          isCreating: false,
        }));
      } else {
        set((state) => ({ posts: [responseData, ...state.posts], isCreating: false }));
      }
    } catch (error: any) {
      throw extractError(error, post.editingId ? 'Failed to update post' : 'Failed to create post');
    } finally {
      set({ isCreating: false, uploadProgress: 0 });
    }
  },

  deletePost: async (id) => {
    await axiosInstance.delete(`/posts/${id}/`);
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },

  deleteAccountPost: async (id: number, accountId: number) => {
    await axiosInstance.delete(`/posts/${id}/account/${accountId}/`);
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },

  deleteScheduledPost: async (id) => {
    await axiosInstance.delete(`/posts/${id}/`);
    set((state) => ({ scheduledPosts: state.scheduledPosts.filter((p) => p.id !== id) }));
  },

  createSchedulingSlot: async (data) => {
    try {
      const { data: slot } = await axiosInstance.post('/scheduling/', data);
      set((state) => ({ schedulingSlots: [...state.schedulingSlots, slot] }));
    } catch (error: any) {
      throw extractError(error, 'Failed to create scheduling slot');
    }
  },

  updateSchedulingSlot: async (id, data) => {
    try {
      const { data: slot } = await axiosInstance.put(`/scheduling/${id}/`, data);
      set((state) => ({
        schedulingSlots: state.schedulingSlots.map((s) => (s.id === id ? slot : s)),
      }));
    } catch (error: any) {
      throw extractError(error, 'Failed to update scheduling slot');
    }
  },

  deleteSchedulingSlot: async (id) => {
    try {
      await axiosInstance.delete(`/scheduling/${id}/`);
      set((state) => ({ schedulingSlots: state.schedulingSlots.filter((s) => s.id !== id) }));
    } catch (error: any) {
      throw extractError(error, 'Failed to delete scheduling slot');
    }
  },

  updatePost: async (id, updateData) => {
    try {
      const { data } = await axiosInstance.put(`/posts/${id}/`, updateData);
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? data : p)),
        scheduledPosts: state.scheduledPosts.map((p) => (p.id === id ? data : p)),
      }));
    } catch (error: any) {
      throw extractError(error, 'Failed to update post');
    }
  },

  fetchDashboard: async () => {
    try {
      const { data } = await axiosInstance.get('/dashboard/');
      return data;
    } catch (error: any) {
      throw extractError(error, 'Failed to fetch dashboard data');
    }
  },
}));
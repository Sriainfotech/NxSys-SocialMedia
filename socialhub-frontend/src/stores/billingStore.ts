import { create } from 'zustand';
import axiosInstance from '@/lib/axiosInstance';

// ── Types ────────────────────────────────────────────────────────────────
export interface Plan {
  id: number | string;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  interval?: 'month' | 'year' | 'monthly' | 'yearly' | string;
  credits?: number;
  credits_per_cycle?: number;
  // Backend seed shape — posts quota per billing cycle. `-1` means unlimited.
  posts_per_month?: number;
  // Max number of social accounts the plan allows.
  max_accounts?: number;
  features?: string[];
  is_popular?: boolean;
  is_free?: boolean;
  razorpay_plan_id?: string;
  [key: string]: any;
}

export interface Subscription {
  id: number | string;
  plan: Plan | null;
  plan_name?: string;
  status: 'active' | 'cancelled' | 'canceled' | 'pending' | 'past_due' | 'expired' | 'trialing' | string;
  is_active?: boolean;
  is_expired?: boolean;
  current_period_start?: string;
  current_period_end?: string;
  // Backend uses British spelling `cancelled_at`; keep both for safety.
  cancelled_at?: string | null;
  cancel_at?: string | null;
  created_at?: string;
  credits_remaining?: number;
  credits_used?: number;
  razorpay_subscription_id?: string;
  [key: string]: any;
}

export interface Usage {
  // Normalized fields the UI reads — 0 when unlimited (check is_unlimited).
  credits_remaining: number;
  credits_used: number;
  credits_total: number;
  // Raw backend fields preserved so we can format UI correctly.
  is_unlimited?: boolean;
  usage_percentage?: number;
  period_start?: string;
  period_end?: string;
  // New in GET /usage/:
  plan_name?: string;
  max_accounts?: number;
  days_left?: number;
  daily_used?: number;
  daily_limit?: number;
  usage_by_platform?: Record<string, number>;
  [key: string]: any;
}

export interface SubscribeResponse {
  subscription_id?: string;
  order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_key_id?: string;
  key?: string;
  key_id?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

// ── Helpers ──────────────────────────────────────────────────────────────
const extractError = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.error) return String(data.error);
  if (data.detail) return String(data.detail);
  if (data.message) return String(data.message);
  try {
    return Object.values(data).flat().filter((v) => typeof v === 'string').join(' ') || fallback;
  } catch {
    return fallback;
  }
};

const normalizeArray = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.results || []);

// ── Store ────────────────────────────────────────────────────────────────
interface BillingState {
  plans: Plan[];
  subscription: Subscription | null;
  usage: Usage | null;
  isLoadingPlans: boolean;
  isLoadingSubscription: boolean;
  isLoadingUsage: boolean;
  isSubscribing: boolean;
  isCancelling: boolean;

  fetchPlans: () => Promise<Plan[]>;
  fetchSubscription: () => Promise<Subscription | null>;
  fetchUsage: () => Promise<Usage | null>;
  fetchAll: () => Promise<void>;
  subscribe: (planId: number | string, planSlug: string) => Promise<SubscribeResponse>;
  cancelSubscription: () => Promise<void>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  plans: [],
  subscription: null,
  usage: null,
  isLoadingPlans: false,
  isLoadingSubscription: false,
  isLoadingUsage: false,
  isSubscribing: false,
  isCancelling: false,

  fetchPlans: async () => {
    set({ isLoadingPlans: true });
    try {
      const { data } = await axiosInstance.get('/plans/');
      const plans = normalizeArray<Plan>(data);
      set({ plans, isLoadingPlans: false });
      return plans;
    } catch (error: any) {
      set({ isLoadingPlans: false });
      throw extractError(error, 'Failed to load plans');
    }
  },

  fetchSubscription: async () => {
    set({ isLoadingSubscription: true });
    try {
      const { data } = await axiosInstance.get('/subscription/');
      // New shape: { subscription: {...}, usage: {...} }
      // Old/flat shape: { id, plan, status, ... }
      const subPayload = data && typeof data === 'object' && 'subscription' in data
        ? data.subscription
        : data;
      const sub: Subscription | null =
        subPayload && (subPayload.id || subPayload.plan || subPayload.status)
          ? subPayload
          : null;

      // If the response embeds usage, populate that state in the same pass so
      // the dashboard / billing page doesn't need a second network call.
      const embeddedUsage = data && typeof data === 'object' && 'usage' in data ? data.usage : null;
      if (embeddedUsage) {
        const rawRemaining = Number(
          embeddedUsage.posts_remaining ?? embeddedUsage.credits_remaining ?? 0
        );
        const rawUsed = Number(embeddedUsage.posts_used ?? embeddedUsage.credits_used ?? 0);
        const rawLimit = Number(embeddedUsage.posts_limit ?? embeddedUsage.credits_total ?? 0);
        const isUnlimited = Boolean(embeddedUsage.is_unlimited) || rawLimit < 0 || rawRemaining < 0;

        set({
          usage: {
            // Normalize -1 values to 0 so the UI math is predictable.
            credits_remaining: isUnlimited ? 0 : Math.max(0, rawRemaining),
            credits_used: Math.max(0, rawUsed),
            credits_total: isUnlimited ? 0 : Math.max(0, rawLimit),
            is_unlimited: isUnlimited,
            usage_percentage: Number(embeddedUsage.usage_percentage ?? 0),
            period_start: embeddedUsage.period_start,
            period_end: embeddedUsage.period_end,
            usage_by_platform: embeddedUsage.usage_by_platform,
            plan_name: typeof embeddedUsage.plan_name === 'string' ? embeddedUsage.plan_name : undefined,
            max_accounts: typeof embeddedUsage.max_accounts === 'number' ? embeddedUsage.max_accounts : undefined,
            days_left: typeof embeddedUsage.days_left === 'number' ? embeddedUsage.days_left : undefined,
            daily_used: typeof embeddedUsage.daily_used === 'number' ? embeddedUsage.daily_used : undefined,
            daily_limit: typeof embeddedUsage.daily_limit === 'number' ? embeddedUsage.daily_limit : undefined,
          },
        });
      }

      set({ subscription: sub, isLoadingSubscription: false });
      return sub;
    } catch (error: any) {
      set({ isLoadingSubscription: false });
      // 404 or no subscription is fine — just null
      if (error?.response?.status === 404) {
        set({ subscription: null });
        return null;
      }
      throw extractError(error, 'Failed to load subscription');
    }
  },

  fetchUsage: async () => {
    set({ isLoadingUsage: true });
    try {
      const { data } = await axiosInstance.get('/usage/');
      const rawRemaining = Number(
        data?.credits_remaining ??
          data?.remaining ??
          data?.posts_remaining ??
          data?.posts_left ??
          0
      );
      const rawUsed = Number(
        data?.credits_used ??
          data?.used ??
          data?.posts_used ??
          data?.posts_this_month ??
          0
      );
      const totalFromBackend =
        data?.credits_total ?? data?.total ?? data?.posts_limit ?? data?.posts_per_month;
      const rawTotal =
        totalFromBackend !== undefined && totalFromBackend !== null
          ? Number(totalFromBackend)
          : rawRemaining + rawUsed;
      const isUnlimited = Boolean(data?.is_unlimited) || rawTotal < 0 || rawRemaining < 0;

      const usage: Usage = {
        credits_remaining: isUnlimited ? 0 : Math.max(0, rawRemaining),
        credits_used: Math.max(0, rawUsed),
        credits_total: isUnlimited ? 0 : Math.max(0, rawTotal),
        is_unlimited: isUnlimited,
        usage_percentage: Number(data?.usage_percentage ?? 0),
        period_start: data?.period_start,
        period_end: data?.period_end,
        usage_by_platform: data?.usage_by_platform,
        plan_name: typeof data?.plan_name === 'string' ? data.plan_name : undefined,
        max_accounts: typeof data?.max_accounts === 'number' ? data.max_accounts : undefined,
        days_left: typeof data?.days_left === 'number' ? data.days_left : undefined,
        daily_used: typeof data?.daily_used === 'number' ? data.daily_used : undefined,
        daily_limit: typeof data?.daily_limit === 'number' ? data.daily_limit : undefined,
      };
      set({ usage, isLoadingUsage: false });
      return usage;
    } catch (error: any) {
      set({ isLoadingUsage: false });
      if (error?.response?.status === 404) {
        set({ usage: null });
        return null;
      }
      throw extractError(error, 'Failed to load usage');
    }
  },

  fetchAll: async () => {
    const { fetchPlans, fetchSubscription, fetchUsage } = get();
    await Promise.allSettled([fetchPlans(), fetchSubscription(), fetchUsage()]);
  },

  subscribe: async (planId, planSlug) => {
    set({ isSubscribing: true });
    try {
      const { data } = await axiosInstance.post('/subscribe/', { plan_id: planId, plan_slug: planSlug });
      set({ isSubscribing: false });
      return data as SubscribeResponse;
    } catch (error: any) {
      set({ isSubscribing: false });
      throw extractError(error, 'Failed to create subscription');
    }
  },

  cancelSubscription: async () => {
    set({ isCancelling: true });
    try {
      await axiosInstance.post('/cancel/');
      // refresh state
      try {
        await get().fetchSubscription();
        await get().fetchUsage();
      } catch {
        /* ignore */
      }
      set({ isCancelling: false });
    } catch (error: any) {
      set({ isCancelling: false });
      throw extractError(error, 'Failed to cancel subscription');
    }
  },
}));

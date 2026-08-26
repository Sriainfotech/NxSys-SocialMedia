declare global {
  interface Window {
    Razorpay?: any;
  }
}

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise: Promise<void> | null = null;

export const loadRazorpay = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load Razorpay'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export interface RazorpayOpenOptions {
  key: string;
  name?: string;
  description?: string;
  image?: string;
  subscription_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler?: (response: {
    razorpay_payment_id?: string;
    razorpay_subscription_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

export const openRazorpay = async (options: RazorpayOpenOptions): Promise<void> => {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error('Razorpay not available');
  const rz = new window.Razorpay(options);
  rz.open();
};

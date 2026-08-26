import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '@/lib/axiosInstance';

interface User {
  id: string;
  email: string;
  name: string;
}

function extractErrorMessage(error: any, fallback: string): string {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;
  if (typeof data === 'object') {
    return (
      Object.values(data)
        .flat()
        .filter((v) => typeof v === 'string')
        .join(' ') || fallback
    );
  }
  return fallback;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (uid: string, token: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const isEmail = identifier.includes('@');
          const payload = isEmail ? { identifier, password } : { username: identifier, password };
          const { data } = await axiosInstance.post('/login/', payload);
          const user: User = {
            id: data.user_id ?? data.id,
            email: data.email,
            name: data.username || data.name || identifier,
          };
          set({ user, isAuthenticated: true, isLoading: false, error: null });
          // Django rotates the CSRF secret on login; re-fetch so the
          // csrftoken cookie matches the new session before any POST.
          axiosInstance.get('/csrf/').catch(() => {});
        } catch (error: any) {
          console.error("Login error:", error.response?.data);
          const errorMessage = extractErrorMessage(error, 'Invalid credentials');
          set({ isLoading: false, error: errorMessage });
          throw errorMessage;
        }
      },
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.post('/register/', { username: name, email, password });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          console.error("Register error:", error.response?.data);
          const errorMessage = extractErrorMessage(error, 'Registration failed');
          set({ isLoading: false, error: errorMessage });
          throw errorMessage;
        }
      },
      logout: async () => {
        try {
          await axiosInstance.post('/logout/');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearSession();
        }
      },
      clearSession: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      clearError: () => set({ error: null }),
      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.post('/auth/password-reset/', { email });
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error, 'Could not send reset email');
          set({ isLoading: false, error: errorMessage });
          throw errorMessage;
        }
      },
      confirmPasswordReset: async (uid: string, token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.post('/auth/password-reset/confirm/', {
            uid,
            token,
            new_password: newPassword,
          });
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error, 'Could not reset password');
          set({ isLoading: false, error: errorMessage });
          throw errorMessage;
        }
      },
      sendVerificationEmail: async () => {
        try {
          await axiosInstance.post('/auth/send-verification/');
        } catch (error: any) {
          throw extractErrorMessage(error, 'Could not send verification email');
        }
      },
      verifyEmail: async (token: string) => {
        try {
          await axiosInstance.get('/auth/verify-email/', { params: { token } });
        } catch (error: any) {
          throw extractErrorMessage(error, 'Could not verify email');
        }
      },
    }),
    {
      name: 'socialhub-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      })
    }
  )
);

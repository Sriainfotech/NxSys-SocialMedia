import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Endpoints that must not trigger the 401-refresh dance
// (avoids infinite loops / sending a token header before one exists).
const AUTH_BOOTSTRAP_PATHS = ['/login/', '/token/refresh/'];

const isAuthBootstrapRequest = (url?: string) =>
  !!url && AUTH_BOOTSTRAP_PATHS.some((path) => url.includes(path));

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  // The refresh token lives in an HttpOnly cookie set by the backend on login.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    "ngrok-skip-browser-warning": "true",
  },
});

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

axiosInstance.interceptors.request.use((config) => {
  // Auth is cookie-based (HttpOnly access/refresh cookies set by the backend).
  // Django compares X-CSRFToken against the csrftoken cookie on every
  // mutating request, including /login/ and /token/refresh/.
  const method = config.method?.toLowerCase();
  if (method && MUTATING_METHODS.has(method)) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(undefined);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthBootstrapRequest(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // No body needed — the backend reads the refresh_token cookie and
        // sets a fresh access_token cookie on the response.
        await axiosInstance.post('/token/refresh/');
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

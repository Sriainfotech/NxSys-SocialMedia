import { useEffect, useState } from 'react';

export type ViewMode = 'grid' | 'list' | 'detailed';

const isMode = (v: unknown): v is ViewMode =>
  v === 'grid' || v === 'list' || v === 'detailed';

/** Persists the chosen view per-page in localStorage. */
export const useViewMode = (
  key: string,
  initial: ViewMode = 'grid'
): [ViewMode, (m: ViewMode) => void] => {
  const [mode, setMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return initial;
    const stored = window.localStorage.getItem(key);
    return isMode(stored) ? stored : initial;
  });

  // Sync with storage changes from other tabs.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && isMode(e.newValue)) setMode(e.newValue);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  const set = (m: ViewMode) => {
    setMode(m);
    try {
      window.localStorage.setItem(key, m);
    } catch {
      /* ignore quota / privacy mode errors */
    }
  };
  return [mode, set];
};

import { useEffect, useState } from 'react';

/**
 * ngrok's free tier returns an HTML warning page for any request it thinks is
 * from a browser. API calls bypass that via the `ngrok-skip-browser-warning`
 * header (set on axios). But plain <img src="…"> and <video src="…"> tags
 * can't send custom headers, so ngrok replies with HTML and the media fails.
 *
 * This hook fetches the URL through `fetch()` (which can send the header),
 * converts the response to a Blob, and returns an object URL you can feed
 * into <img> / <video>. For non-ngrok hosts it returns the URL unchanged.
 */
const NGROK_PATTERN = /ngrok-free\.(?:app|dev)|ngrok\.io|ngrok\.dev/i;

const needsAuth = (url: string): boolean => NGROK_PATTERN.test(url);

// tiny module-level cache so revisiting the same tile doesn't refetch
const blobCache = new Map<string, string>();

export const useAuthenticatedSrc = (src: string | null | undefined): string => {
  const initial = !src ? '' : !needsAuth(src) ? src : blobCache.get(src) || '';
  const [resolved, setResolved] = useState<string>(initial);

  useEffect(() => {
    if (!src) {
      setResolved('');
      return;
    }
    if (!needsAuth(src)) {
      setResolved(src);
      return;
    }

    // cached?
    const cached = blobCache.get(src);
    if (cached) {
      setResolved(cached);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    fetch(src, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        blobCache.set(src, createdUrl);
        setResolved(createdUrl);
      })
      .catch(() => {
        // Fallback — let the browser try the original URL; worst case the
        // request fails, which is what would have happened anyway.
        if (!cancelled) setResolved(src);
      });

    return () => {
      cancelled = true;
      // Note: we intentionally do NOT revoke `createdUrl` here — we cache it
      // for reuse across tiles. Browsers will GC it on page unload.
    };
  }, [src]);

  return resolved;
};

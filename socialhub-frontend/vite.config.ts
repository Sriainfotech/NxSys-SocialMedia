import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ProxyOptions } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // The PROXY target must be the ABSOLUTE backend host (with protocol).
  // This is separate from VITE_API_URL, which the browser uses as a
  // relative path ("/api") and must NOT be reused as the proxy target.
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8001';

  // Fail loudly at startup if the target is missing/relative, instead of
  // letting http-proxy throw "Cannot read properties of null (reading 'split')".
  if (!/^https?:\/\//.test(proxyTarget)) {
    throw new Error(
      `[vite] VITE_PROXY_TARGET must be an absolute URL with http(s):// — got "${proxyTarget}". ` +
      `Set it to your Django host, e.g. http://localhost:8001`
    );
  }
  console.log('[vite] proxy target =', proxyTarget);
  const proxyBase: ProxyOptions = {
    target: proxyTarget,
    changeOrigin: true,
    secure: false,
    // Cookie-based auth: if the backend sets an explicit Domain attribute
    // (e.g. Domain=nxsocial.nxsys.in), the browser will reject it since the
    // dev server appears as localhost. Strip it so cookies stay host-only
    // for whatever origin the browser actually sees.
    cookieDomainRewrite: '',
    headers: { 'ngrok-skip-browser-warning': 'true' },
    configure: (proxy) => {
      proxy.on('error', (err: Error, _req: IncomingMessage, _res: ServerResponse) => {
        console.error('[vite proxy] ERROR:', err.message);
        console.error(err.stack);
      });
      proxy.on('proxyReq', (_proxyReq: unknown, req: IncomingMessage) => {
        console.log('[vite proxy] →', req.method, req.url);
      });
    },
  };

  return {
    server: {
      host: '::',
      port: 8080,
      hmr: { overlay: false },
      proxy: {
        '/api': proxyBase,
        '/media': proxyBase,
      },
    },

    plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
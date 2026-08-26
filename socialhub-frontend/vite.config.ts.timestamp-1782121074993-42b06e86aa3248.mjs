// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/safur/OneDrive/Desktop/socialhub-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/safur/OneDrive/Desktop/socialhub-frontend/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/safur/OneDrive/Desktop/socialhub-frontend/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\safur\\OneDrive\\Desktop\\socialhub-frontend";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:8001";
  if (!/^https?:\/\//.test(proxyTarget)) {
    throw new Error(
      `[vite] VITE_PROXY_TARGET must be an absolute URL with http(s):// \u2014 got "${proxyTarget}". Set it to your Django host, e.g. http://localhost:8001`
    );
  }
  console.log("[vite] proxy target =", proxyTarget);
  const proxyBase = {
    target: proxyTarget,
    changeOrigin: true,
    secure: false,
    headers: { "ngrok-skip-browser-warning": "true" },
    configure: (proxy) => {
      proxy.on("error", (err, _req, _res) => {
        console.error("[vite proxy] ERROR:", err.message);
        console.error(err.stack);
      });
      proxy.on("proxyReq", (_proxyReq, req) => {
        console.log("[vite proxy] \u2192", req.method, req.url);
      });
    }
  };
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
      proxy: {
        "/api": proxyBase,
        "/media": proxyBase
      }
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzYWZ1clxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHNvY2lhbGh1Yi1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcc2FmdXJcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxzb2NpYWxodWItZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3NhZnVyL09uZURyaXZlL0Rlc2t0b3Avc29jaWFsaHViLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB0eXBlIHsgUHJveHlPcHRpb25zIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHR5cGUgeyBJbmNvbWluZ01lc3NhZ2UsIFNlcnZlclJlc3BvbnNlIH0gZnJvbSBcImh0dHBcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcclxuXHJcbiAgLy8gVGhlIFBST1hZIHRhcmdldCBtdXN0IGJlIHRoZSBBQlNPTFVURSBiYWNrZW5kIGhvc3QgKHdpdGggcHJvdG9jb2wpLlxyXG4gIC8vIFRoaXMgaXMgc2VwYXJhdGUgZnJvbSBWSVRFX0FQSV9VUkwsIHdoaWNoIHRoZSBicm93c2VyIHVzZXMgYXMgYVxyXG4gIC8vIHJlbGF0aXZlIHBhdGggKFwiL2FwaVwiKSBhbmQgbXVzdCBOT1QgYmUgcmV1c2VkIGFzIHRoZSBwcm94eSB0YXJnZXQuXHJcbiAgY29uc3QgcHJveHlUYXJnZXQgPSBlbnYuVklURV9QUk9YWV9UQVJHRVQgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMSc7XHJcblxyXG4gIC8vIEZhaWwgbG91ZGx5IGF0IHN0YXJ0dXAgaWYgdGhlIHRhcmdldCBpcyBtaXNzaW5nL3JlbGF0aXZlLCBpbnN0ZWFkIG9mXHJcbiAgLy8gbGV0dGluZyBodHRwLXByb3h5IHRocm93IFwiQ2Fubm90IHJlYWQgcHJvcGVydGllcyBvZiBudWxsIChyZWFkaW5nICdzcGxpdCcpXCIuXHJcbiAgaWYgKCEvXmh0dHBzPzpcXC9cXC8vLnRlc3QocHJveHlUYXJnZXQpKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgIGBbdml0ZV0gVklURV9QUk9YWV9UQVJHRVQgbXVzdCBiZSBhbiBhYnNvbHV0ZSBVUkwgd2l0aCBodHRwKHMpOi8vIFx1MjAxNCBnb3QgXCIke3Byb3h5VGFyZ2V0fVwiLiBgICtcclxuICAgICAgYFNldCBpdCB0byB5b3VyIERqYW5nbyBob3N0LCBlLmcuIGh0dHA6Ly9sb2NhbGhvc3Q6ODAwMWBcclxuICAgICk7XHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKCdbdml0ZV0gcHJveHkgdGFyZ2V0ID0nLCBwcm94eVRhcmdldCk7XHJcbiAgY29uc3QgcHJveHlCYXNlOiBQcm94eU9wdGlvbnMgPSB7XHJcbiAgICB0YXJnZXQ6IHByb3h5VGFyZ2V0LFxyXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgc2VjdXJlOiBmYWxzZSxcclxuICAgIGhlYWRlcnM6IHsgJ25ncm9rLXNraXAtYnJvd3Nlci13YXJuaW5nJzogJ3RydWUnIH0sXHJcbiAgICBjb25maWd1cmU6IChwcm94eSkgPT4ge1xyXG4gICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyOiBFcnJvciwgX3JlcTogSW5jb21pbmdNZXNzYWdlLCBfcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t2aXRlIHByb3h5XSBFUlJPUjonLCBlcnIubWVzc2FnZSk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2spO1xyXG4gICAgICB9KTtcclxuICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKF9wcm94eVJlcTogdW5rbm93biwgcmVxOiBJbmNvbWluZ01lc3NhZ2UpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW3ZpdGUgcHJveHldIFx1MjE5MicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiAnOjonLFxyXG4gICAgICBwb3J0OiA4MDgwLFxyXG4gICAgICBobXI6IHsgb3ZlcmxheTogZmFsc2UgfSxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHByb3h5QmFzZSxcclxuICAgICAgICAnL21lZGlhJzogcHJveHlCYXNlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1YsU0FBUyxjQUFjLGVBQWU7QUFDMVgsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFLM0MsUUFBTSxjQUFjLElBQUkscUJBQXFCO0FBSTdDLE1BQUksQ0FBQyxlQUFlLEtBQUssV0FBVyxHQUFHO0FBQ3JDLFVBQU0sSUFBSTtBQUFBLE1BQ1IsZ0ZBQTJFLFdBQVc7QUFBQSxJQUV4RjtBQUFBLEVBQ0Y7QUFDQSxVQUFRLElBQUkseUJBQXlCLFdBQVc7QUFDaEQsUUFBTSxZQUEwQjtBQUFBLElBQzlCLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLFFBQVE7QUFBQSxJQUNSLFNBQVMsRUFBRSw4QkFBOEIsT0FBTztBQUFBLElBQ2hELFdBQVcsQ0FBQyxVQUFVO0FBQ3BCLFlBQU0sR0FBRyxTQUFTLENBQUMsS0FBWSxNQUF1QixTQUF5QjtBQUM3RSxnQkFBUSxNQUFNLHVCQUF1QixJQUFJLE9BQU87QUFDaEQsZ0JBQVEsTUFBTSxJQUFJLEtBQUs7QUFBQSxNQUN6QixDQUFDO0FBQ0QsWUFBTSxHQUFHLFlBQVksQ0FBQyxXQUFvQixRQUF5QjtBQUNqRSxnQkFBUSxJQUFJLHVCQUFrQixJQUFJLFFBQVEsSUFBSSxHQUFHO0FBQUEsTUFDbkQsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sS0FBSyxFQUFFLFNBQVMsTUFBTTtBQUFBLE1BQ3RCLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLElBRUEsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLElBQzlFLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

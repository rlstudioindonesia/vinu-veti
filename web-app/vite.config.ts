import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Web / iPhone build (`npm run build:web`): adds a service worker that keeps the whole app on the
 * phone, so after the first visit it opens offline (content itself is mirrored to IndexedDB by the
 * app, like on Android). The list of files to keep is generated from the build output.
 */
function serviceWorker(): Plugin {
  return {
    name: 'vv-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      // Everything the kids' app needs (admin-only compressor and old-browser font files are left out)
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map') && !f.includes('glbCompress') && !f.endsWith('.woff'));
      const version = Date.now().toString(36);
      const source = `// Generated at build time (vite.config.ts)
const CACHE = 'vv-app-${version}';
const PRECACHE = ${JSON.stringify(['./', ...files, ...STATIC_FILES])};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(PRECACHE.map((f) => c.add(f).catch(() => undefined)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('vv-app-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only the app itself: content (Supabase) is mirrored by the app into IndexedDB
  if (url.origin !== self.location.origin) return;
  // Page: network first (gets updates), offline from the cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./', { ignoreSearch: true }))
    );
    return;
  }
  // Build files never change (hashed names): cache first
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && !url.pathname.includes('/content/')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// Files from public/ the app needs offline (public files are not part of the bundle list)
const STATIC_FILES = [
  'manifest.webmanifest',
  'mascot.png',
  'vinu-veti-logo.png',
  'app-icon.png',
  'icons/icon-192.png',
  'icons/apple-touch-icon.png',
  'privacy-policy.html',
  'draco/draco_decoder.wasm',
  'draco/draco_wasm_wrapper.js',
];

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'web' ? [serviceWorker()] : [])],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Android: into the app's assets. Web/iPhone: a normal folder to host (Cloudflare Pages, Netlify)
    outDir: mode === 'web' ? path.resolve(__dirname, 'dist') : path.resolve(__dirname, '../app/src/main/assets/www'),
    emptyOutDir: true,
  },
}));

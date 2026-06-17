// Service Worker PWA v203 - TRẮC NGHIỆM KIẾN THỨC
const CACHE_VERSION = 'hqkv8-learning-v203';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL).catch(() => null)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_VERSION && /hqkv8|tracnghiem|learning|pwa/i.test(key)).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Không cache dữ liệu/API ngoài domain để tránh cũ dữ liệu học tập/trắc nghiệm.
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('./').then(res => res || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy)).catch(() => null);
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

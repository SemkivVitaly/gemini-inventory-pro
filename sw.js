const CACHE_NAME = 'gemini-inventory-pro-v9';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useLocalStorage.ts',
  '/services/geminiService.ts',
  '/components/Layout.tsx',
  '/components/Comparer.tsx',
  '/components/Chat.tsx',
  '/components/Files.tsx',
  '/components/History.tsx',
  '/components/QrScanner.tsx',
  '/components/icons.tsx',
  '/components/MarkdownRenderer.tsx',
  '/components/AnalysisModal.tsx',
  '/components/InstallPWA.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching app assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Pre-caching failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Stale-while-revalidate for CDN resources
  const isCdnUrl = event.request.url.startsWith('https://aistudiocdn.com/') || 
                   event.request.url.startsWith('https://cdn.tailwindcss.com') ||
                   event.request.url.startsWith('https://unpkg.com');

  if (isCdnUrl) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if(networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(err => console.error('[Service Worker] Fetch failed for CDN:', event.request.url, err));
          
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Cache-first for local assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we have a response in the cache, return it.
        // Otherwise, fetch from the network.
        return response || fetch(event.request).catch(() => caches.match('/'));
      })
  );
});
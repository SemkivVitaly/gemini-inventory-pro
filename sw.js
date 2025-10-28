const CACHE_NAME = 'gemini-inventory-pro-v3';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot-desktop.png',
  '/screenshot-mobile.png'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => console.error('App shell caching failed:', err))
  );
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Serve from cache, fallback to network, and update cache
self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For requests to external resources (CDNs), use a "stale-while-revalidate" strategy
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
          }).catch(err => console.error('Fetch failed for CDN resource:', event.request.url, err));
          
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // For navigation requests, use network-first to ensure fresh content, fallback to cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/')) // Fallback to the cached root page
    );
    return;
  }

  // For local assets (app shell), use cache-first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
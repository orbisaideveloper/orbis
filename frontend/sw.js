// 🟢 Cache Busted Version 2.0 (Network First Strategy)
const CACHE_NAME = 'orbis-v2-cache-bust';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/platform-core.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // 🟢 Force new service worker to activate immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching Core Assets');
            return cache.addAll(urlsToCache);
        })
    );
});

// 🟢 Network First Strategy (Always get latest code if internet is on)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).then(response => {
            // Update cache dynamically
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
                return response;
            });
        }).catch(() => {
            // Fallback to cache ONLY if offline
            return caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Final fallback for HTML pages
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 🟢 Take control immediately
    );
});

const CACHE_NAME = 'orbis-v1-cache';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/platform-core.js',
  '/manifest.json'
];

// Install Service Worker & Cache Files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[Service Worker] Caching Core Assets');
            return cache.addAll(urlsToCache);
        })
    );
});

// Serve from Cache when Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Return cached version or fetch from network
            return response || fetch(event.request);
        }).catch(() => {
            // Fallback for offline mode if page is not cached
            if(event.request.mode === 'navigate') {
                return caches.match('/');
            }
        })
    );
});

// Update Cache & Remove Old Ones
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
        })
    );
});

const CACHE_NAME = 'lottery-pwa-v1';
const urlsToCache = [
    './index.html',
    './bootstrap.js',
    './ui/lottery-app.js'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch from Cache first, then Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return cached file
                }
                return fetch(event.request); // Fetch from network
            })
    );
});

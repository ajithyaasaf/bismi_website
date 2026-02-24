const CACHE_NAME = 'bismi-v1';
const STATIC_ASSETS = [
    '/',
    '/menu',
    '/logo.jpg',
    '/manifest.json',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Firebase and external API calls
    if (
        request.url.includes('firestore.googleapis.com') ||
        request.url.includes('identitytoolkit.googleapis.com') ||
        request.url.includes('securetoken.googleapis.com')
    ) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const fetched = fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached version on network failure
                    return cached;
                });

            // Return cached immediately, update in background (stale-while-revalidate)
            return cached || fetched;
        })
    );
});

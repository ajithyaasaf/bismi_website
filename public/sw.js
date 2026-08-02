const CACHE_NAME = 'bismi-pwa-v2';

// Core static shell assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
    '/',
    '/menu',
    '/track-order',
    '/logo.png',
    '/manifest.json',
    '/assets/images/coming-soon-box.png',
    '/assets/images/menu-section2/raw-meat-bowl.png',
];

// Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('PWA Pre-cache partial warning:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate Event: Cleanup stale caches
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

// Fetch Event: Cache-First for static assets, Stale-While-Revalidate for pages
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Skip Firebase Firestore, Google Analytics, and auth backend APIs
    if (
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('identitytoolkit.googleapis.com') ||
        url.hostname.includes('securetoken.googleapis.com') ||
        url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('googletagmanager.com')
    ) {
        return;
    }

    // Static Media & Assets (Images, Fonts, CSS, JS) -> CACHE FIRST with Background Refresh
    const isStaticAsset =
        request.destination === 'image' ||
        request.destination === 'font' ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        url.pathname.startsWith('/assets/') ||
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.avif') ||
        url.pathname.endsWith('.svg');

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // Page HTML Navigation Requests -> STALE-WHILE-REVALIDATE for fast 3G rendering
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return cachedResponse;
                });

            return cachedResponse || fetchPromise;
        })
    );
});

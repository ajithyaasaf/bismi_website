'use client';

import { useEffect } from 'react';
import { syncPendingOfflineOrders } from '@/lib/offlineQueue';

export default function ServiceWorkerRegistrar() {
    useEffect(() => {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('PWA Service Worker registered:', reg.scope);
                })
                .catch((err) => {
                    console.warn('PWA Service Worker registration failed:', err);
                });
        }

        // Trigger background offline order sync if online
        if (navigator.onLine) {
            syncPendingOfflineOrders();
        }
    }, []);

    return null;
}

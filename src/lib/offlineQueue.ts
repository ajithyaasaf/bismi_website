import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const OFFLINE_QUEUE_KEY = 'bismi_pending_offline_orders';

export interface PendingOfflineOrder {
    offlineId: string;
    orderData: Record<string, unknown>;
    timestamp: number;
}

/**
 * Save an order locally when network connectivity fails or drops.
 * Cleanly strips non-serializable Firestore FieldValues before saving to localStorage.
 */
export function savePendingOfflineOrder(orderData: Record<string, unknown>): string {
    const offlineId = `OFFLINE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Strip non-serializable serverTimestamp() objects for local JSON storage
    const cleanData = { ...orderData };
    delete cleanData.createdAt;
    delete cleanData.updatedAt;

    const pendingItem: PendingOfflineOrder = {
        offlineId,
        orderData: {
            ...cleanData,
            id: offlineId,
            offlineId,
            createdAtIso: new Date().toISOString(),
            isOfflineSynced: false,
        },
        timestamp: Date.now(),
    };

    try {
        const existingRaw = localStorage.getItem(OFFLINE_QUEUE_KEY);
        const existing: PendingOfflineOrder[] = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(pendingItem);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existing));
    } catch (err) {
        console.error('Failed to save offline order to localStorage:', err);
    }

    return offlineId;
}

/**
 * Retrieve a pending offline order by its offline ID (used for order confirmation display).
 */
export function getPendingOfflineOrder(offlineId: string): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;

    try {
        const existingRaw = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (!existingRaw) return null;

        const pendingList: PendingOfflineOrder[] = JSON.parse(existingRaw);
        const item = pendingList.find(p => p.offlineId === offlineId || p.orderData?.id === offlineId);
        return item ? item.orderData : null;
    } catch (err) {
        console.error('Failed to read offline order from localStorage:', err);
        return null;
    }
}

/**
 * Background auto-sync pending offline orders to Firebase when back online.
 */
export async function syncPendingOfflineOrders(): Promise<number> {
    if (typeof window === 'undefined' || !navigator.onLine) return 0;

    try {
        const existingRaw = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (!existingRaw) return 0;

        const pendingList: PendingOfflineOrder[] = JSON.parse(existingRaw);
        if (!Array.isArray(pendingList) || pendingList.length === 0) return 0;

        let syncedCount = 0;
        const remaining: PendingOfflineOrder[] = [];

        for (const item of pendingList) {
            try {
                const firestorePayload = {
                    ...item.orderData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    syncedFromOfflineAt: serverTimestamp(),
                    isOfflineSynced: true,
                };

                await addDoc(collection(db, 'orders'), firestorePayload);
                syncedCount++;
            } catch (err) {
                console.warn(`Failed to sync offline order ${item.offlineId}:`, err);
                remaining.push(item); // Retain in queue for next network attempt
            }
        }

        if (remaining.length === 0) {
            localStorage.removeItem(OFFLINE_QUEUE_KEY);
        } else {
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
        }

        return syncedCount;
    } catch (err) {
        console.error('Error during offline order auto-sync:', err);
        return 0;
    }
}

// Auto-register online sync listener on client side
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        syncPendingOfflineOrders();
    });

    if (navigator.onLine) {
        setTimeout(() => {
            syncPendingOfflineOrders();
        }, 2000);
    }
}

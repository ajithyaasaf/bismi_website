/**
 * Slot Control — Firestore helpers for delivery slot management.
 *
 * Collection: /dailySlotControl/{YYYY-MM-DD}
 *
 * Provides:
 *  - CRUD for daily slot control documents
 *  - Order counting per slot (indexed queries)
 *  - Buffer-time blocking logic
 *  - Unified slot availability resolver
 *
 * Failsafe: every public-facing function returns safe defaults on error
 * so that ordering is NEVER blocked.
 */

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getCountFromServer,
} from 'firebase/firestore';
import { db } from './firebase';
import {
    DELIVERY_SLOT_KEYS,
    BUFFER_TIME_MINUTES,
    DEFAULT_SLOT_LIMIT,
} from './config';
import type { DailySlotControl, SlotKey, SlotConfig } from '@/types';

// ─── Constants ────────────────────────────────────────────
const COLLECTION_NAME = 'dailySlotControl';

/** IST offset in minutes (UTC+5:30). */
const IST_OFFSET_MINUTES = 330;

// ─── Date Helpers ─────────────────────────────────────────

/**
 * Returns today's date as `YYYY-MM-DD` in IST, regardless of user timezone.
 */
export function getTodayDateString(): string {
    return getDateStringIST(new Date());
}

/**
 * Returns tomorrow's date as `YYYY-MM-DD` in IST.
 */
export function getTomorrowDateString(): string {
    const now = new Date();
    const istMs = now.getTime() + (now.getTimezoneOffset() + IST_OFFSET_MINUTES) * 60_000;
    const tomorrow = new Date(istMs + 86_400_000);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Converts a JS Date to `YYYY-MM-DD` in IST.
 */
function getDateStringIST(date: Date): string {
    const istMs = date.getTime() + (date.getTimezoneOffset() + IST_OFFSET_MINUTES) * 60_000;
    const ist = new Date(istMs);
    const y = ist.getFullYear();
    const m = String(ist.getMonth() + 1).padStart(2, '0');
    const d = String(ist.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Returns the current hour and minute in IST (24-hour).
 */
function getCurrentTimeIST(): { hour: number; minute: number } {
    const now = new Date();
    const istMs = now.getTime() + (now.getTimezoneOffset() + IST_OFFSET_MINUTES) * 60_000;
    const ist = new Date(istMs);
    return { hour: ist.getHours(), minute: ist.getMinutes() };
}

// ─── Default Data ─────────────────────────────────────────

/**
 * Returns the default slot control document
 * (shop open, all slots enabled, default limit).
 */
export function getDefaultSlotControl(): DailySlotControl {
    const slots = {} as Record<SlotKey, SlotConfig>;
    for (const s of DELIVERY_SLOT_KEYS) {
        slots[s.key as SlotKey] = { enabled: true, maxOrders: DEFAULT_SLOT_LIMIT };
    }
    return { shopClosed: false, slots };
}

// ─── Firestore CRUD ───────────────────────────────────────

/**
 * Fetch the daily slot control document for a given date.
 * Returns the Firestore document if it exists, otherwise returns defaults.
 * On any error, returns defaults (failsafe).
 */
export async function fetchDailySlotControl(date: string): Promise<DailySlotControl> {
    try {
        const ref = doc(db, COLLECTION_NAME, date);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            return getDefaultSlotControl();
        }

        const data = snap.data() as Partial<DailySlotControl>;

        // Merge with defaults to handle partially-created documents
        const defaults = getDefaultSlotControl();
        return {
            shopClosed: data.shopClosed ?? defaults.shopClosed,
            slots: {
                ...defaults.slots,
                ...(data.slots ?? {}),
            },
        };
    } catch (err) {
        console.error('[slotControl] fetchDailySlotControl failed, using defaults:', err);
        return getDefaultSlotControl();
    }
}

/**
 * Save/update the daily slot control document.
 * Uses `merge: true` to avoid overwriting other fields.
 */
export async function saveDailySlotControl(
    date: string,
    data: Partial<DailySlotControl>,
): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, date);
    await setDoc(ref, data, { merge: true });
}

// ─── Order Count Queries ──────────────────────────────────

/** Status values that count towards slot capacity. */
const COUNTABLE_STATUSES = ['pending', 'confirmed', 'accepted'];

/**
 * Count orders for a specific slot on a given date.
 * Uses `getCountFromServer` for efficiency — no document downloads.
 */
export async function getOrderCountForSlot(
    date: string,
    slotKey: string,
): Promise<number> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('deliveryDate', '==', date),
            where('deliverySlot', '==', slotKey),
            where('status', 'in', COUNTABLE_STATUSES),
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (err) {
        console.error(`[slotControl] getOrderCountForSlot(${date}, ${slotKey}) failed:`, err);
        return 0; // Failsafe: assume 0 so slot stays open
    }
}

/**
 * Get order counts for ALL slots on a given date.
 * Fires all queries in parallel for speed.
 */
export async function getOrderCountsForAllSlots(
    date: string,
): Promise<Record<string, number>> {
    const entries = await Promise.all(
        DELIVERY_SLOT_KEYS.map(async (s) => {
            const count = await getOrderCountForSlot(date, s.key);
            return [s.key, count] as [string, number];
        }),
    );
    return Object.fromEntries(entries);
}

// ─── Buffer Time Logic ────────────────────────────────────

/**
 * Returns `true` if a slot is blocked by buffer time.
 * Only applies to today — never blocks future dates.
 *
 * Rule: customer can order for slot only if
 *   currentTime < (slotStartHour − BUFFER_TIME_MINUTES)
 */
export function isSlotBlockedByBuffer(
    startHour: number,
    isToday: boolean,
): boolean {
    if (!isToday) return false;

    const { hour, minute } = getCurrentTimeIST();
    const currentMinutes = hour * 60 + minute;
    const slotStartMinutes = startHour * 60;
    const cutoffMinutes = slotStartMinutes - BUFFER_TIME_MINUTES;

    return currentMinutes >= cutoffMinutes;
}

// ─── Unified Slot Availability ────────────────────────────

export interface AvailableSlot {
    key: string;
    label: string;
    startHour: number;
    orderCount: number;
    maxOrders: number;
}

export interface SlotAvailabilityResult {
    shopClosed: boolean;
    /** Date string (YYYY-MM-DD) these slots are for. */
    date: string;
    /** Whether this is today or a future date (e.g. tomorrow). */
    isToday: boolean;
    slots: AvailableSlot[];
    /** Set to true if the result fell back to tomorrow specifically because today was marked closed. */
    shopClosedToday?: boolean;
}

/**
 * Main entry point for checkout: resolves which slots are available.
 *
 * Algorithm per slot:
 *   1. Skip if shopClosed
 *   2. Skip if slot.enabled === false
 *   3. Skip if orderCount >= maxOrders
 *   4. Skip if buffer time blocks it (today only)
 *
 * If ALL today slots are unavailable, automatically fetches tomorrow's.
 * On any error, returns all slots with defaults (failsafe).
 */
export async function getAvailableSlots(date: string): Promise<SlotAvailabilityResult> {
    const today = getTodayDateString();
    const isToday = date === today;

    try {
        // Parallel fetch: control doc + order counts
        const [control, counts] = await Promise.all([
            fetchDailySlotControl(date),
            getOrderCountsForAllSlots(date),
        ]);

        // Shop closed → no today slots
        if (control.shopClosed && isToday) {
            // Auto-fallback to tomorrow
            const tomorrow = getTomorrowDateString();
            const tomorrowResult = await getAvailableSlots(tomorrow);
            return { ...tomorrowResult, shopClosedToday: true };
        }

        const available: AvailableSlot[] = [];

        for (const slotDef of DELIVERY_SLOT_KEYS) {
            const key = slotDef.key as SlotKey;
            const slotConfig = control.slots[key] ?? { enabled: true, maxOrders: DEFAULT_SLOT_LIMIT };

            // Skip disabled
            if (!slotConfig.enabled) continue;

            const orderCount = counts[key] ?? 0;

            // Skip full
            if (orderCount >= slotConfig.maxOrders) continue;

            // Skip buffer-blocked (today only)
            if (isSlotBlockedByBuffer(slotDef.startHour, isToday)) continue;

            available.push({
                key: slotDef.key,
                label: slotDef.label,
                startHour: slotDef.startHour,
                orderCount,
                maxOrders: slotConfig.maxOrders,
            });
        }

        // If no today slots available, try tomorrow
        if (available.length === 0 && isToday) {
            const tomorrow = getTomorrowDateString();
            return getAvailableSlots(tomorrow);
        }

        return {
            shopClosed: control.shopClosed,
            date,
            isToday,
            slots: available,
        };
    } catch (err) {
        console.error('[slotControl] getAvailableSlots failed, using failsafe defaults:', err);

        // Failsafe: return all slots with defaults
        return {
            shopClosed: false,
            date,
            isToday,
            slots: DELIVERY_SLOT_KEYS
                .filter((s) => !isSlotBlockedByBuffer(s.startHour, isToday))
                .map((s) => ({
                    key: s.key,
                    label: s.label,
                    startHour: s.startHour,
                    orderCount: 0,
                    maxOrders: DEFAULT_SLOT_LIMIT,
                })),
        };
    }
}

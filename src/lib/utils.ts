import { v4 as uuidv4 } from 'uuid';
import { SHOP_CONFIG } from './config';
import { Timestamp } from 'firebase/firestore';

/**
 * Format a number as Indian Rupee currency.
 */
export function formatCurrency(amount: number): string {
    return `${SHOP_CONFIG.currency}${amount.toFixed(2)}`;
}

/**
 * Generate a unique idempotency token to prevent duplicate orders.
 */
export function generateIdempotencyToken(): string {
    return uuidv4();
}

/**
 * Validate Indian mobile number (10 digits, starts with 6-9).
 */
export function validateMobile(mobile: string): boolean {
    return /^[6-9]\d{9}$/.test(mobile);
}

/**
 * Validate quantity (min 0.5kg, step 0.25kg).
 */
export function validateQuantity(kg: number): boolean {
    return kg >= 0.5 && kg <= 50 && (kg * 4) % 1 === 0;
}

/**
 * Format Firestore Timestamp to readable date string.
 */
export function formatDate(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return '—';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Format short date (for admin list).
 */
export function formatShortDate(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return '—';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Build WhatsApp URL with pre-filled message.
 */
export function buildWhatsAppUrl(orderId: string, customerName: string): string {
    const message = encodeURIComponent(
        `Hi Bismi Broilers! I just placed order #${orderId}. My name is ${customerName}. Please confirm.`
    );
    return `https://wa.me/${SHOP_CONFIG.whatsapp}?text=${message}`;
}

/**
 * Compute delivery charge — always free.
 */
export function computeDeliveryCharge(_subtotal: number): number {
    return 0;
}

/**
 * Truncate text to a max length.
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
}

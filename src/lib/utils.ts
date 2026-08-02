import { v4 as uuidv4 } from 'uuid';
import { SHOP_CONFIG } from './config';
import { Timestamp } from 'firebase/firestore';
import { Order } from '@/types';

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
 * Format Firestore Timestamp or Date/ISO string to readable date string.
 */
export function formatDate(timestamp: Timestamp | Date | string | number | null | undefined): string {
    if (!timestamp) return '—';
    try {
        let date: Date;
        if (typeof (timestamp as Timestamp)?.toDate === 'function') {
            date = (timestamp as Timestamp).toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp as string);
        }

        if (isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return '—';
    }
}

/**
 * Format short date (for admin list).
 */
export function formatShortDate(timestamp: Timestamp | Date | string | number | null | undefined): string {
    if (!timestamp) return '—';
    try {
        let date: Date;
        if (typeof (timestamp as Timestamp)?.toDate === 'function') {
            date = (timestamp as Timestamp).toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp as string);
        }

        if (isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return '—';
    }
}

/**
 * Build WhatsApp URL with pre-filled message for Order Confirmation.
 */
export function buildWhatsAppUrl(orderId: string, customerName?: string, totalAmount?: number): string {
    const formattedId = orderId.length > 8 ? orderId.slice(-8).toUpperCase() : orderId;
    const nameText = customerName ? ` Name: ${customerName}.` : '';
    const totalText = totalAmount ? ` Total: ₹${totalAmount.toFixed(2)}.` : '';

    const message = encodeURIComponent(
        `Hi Bismi Broilers! I placed Order #${formattedId}.${nameText}${totalText} Please confirm delivery.`
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
 * Build WhatsApp URL with cart items for fallback ordering.
 */
export function buildWhatsAppCartUrl(
    items: Array<{ meatName: string; unit: 'kg' | 'piece'; kg?: number; pieces?: number; pricePerKg?: number; pricePerPiece?: number }>,
    total: number,
    deliveryType: string
): string {
    const itemLines = items.map((item) => {
        if (item.unit === 'piece') {
            const qty = item.pieces ?? 0;
            const price = qty * (item.pricePerPiece ?? 0);
            return `${qty} × ${item.meatName} – ₹${price.toFixed(2)}`;
        }
        const qty = item.kg ?? 0;
        const price = qty * (item.pricePerKg ?? 0);
        return `${item.meatName} (${qty} kg) – ₹${price.toFixed(2)}`;
    }).join('\n');

    const deliveryLabel = deliveryType === 'pickup' ? 'Pickup from shop' : 'Home delivery';

    const message = encodeURIComponent(
        `Hi, I want to order:\n\n${itemLines}\n\nDelivery: ${deliveryLabel}\nTotal: ₹${total.toFixed(2)}\n\nName:\nAddress:`
    );
    return `https://wa.me/${SHOP_CONFIG.whatsapp}?text=${message}`;
}

/**
 * Build WhatsApp URL with order details for admin to send to customer.
 */
export function buildWhatsAppOrderUrl(order: Order): string {
    const itemLines = order.items.map((item) => {
        if (item.unit === 'piece') {
            const qty = item.pieces ?? 0;
            const price = qty * (item.pricePerPiece ?? 0);
            return `- ${qty} pcs × ${item.meatName} – ₹${price.toFixed(2)}`;
        }
        const qty = item.kg ?? 0;
        const price = qty * (item.pricePerKg ?? 0);
        return `- ${item.meatName} (${qty} kg) – ₹${price.toFixed(2)}`;
    }).join('\n');

    const deliveryLabel = order.deliveryType === 'pickup'
        ? 'Pickup from shop'
        : `Home delivery${order.deliveryZoneLabel ? ` — ${order.deliveryZoneLabel}` : ''}${order.deliveryTimeSlot ? ` (${order.deliveryTimeSlot})` : ''}`;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const trackingUrl = `${baseUrl}/track-order?mobile=${order.mobile}`;

    const message = encodeURIComponent(
        `Hi ${order.customerName || 'there'},\n\nYour order from ${SHOP_CONFIG.name} is confirmed!\n\nOrder Details:\n${itemLines}\n\nDelivery: ${deliveryLabel}\nPayment: ${order.paymentMethod || 'Cash on Delivery'}\nTotal: ₹${order.totalAmount.toFixed(2)}\n\nWe will prepare your order shortly.\n\nTrack your order here:\n${trackingUrl}`
    );
    return `https://wa.me/91${order.mobile}?text=${message}`;
}

/**
 * Truncate text to a max length.
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
}

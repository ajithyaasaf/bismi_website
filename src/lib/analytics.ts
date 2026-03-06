// ─── Google Analytics (GA4) Utility ──────────────────────
// Safe, typed wrappers around gtag. All calls are no-ops
// when GA_ID is missing or gtag has not loaded yet.

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
        dataLayer: unknown[];
    }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Track a page view (SPA navigation).
 * Called automatically by the GoogleAnalytics component on route changes.
 */
export function pageview(url: string): void {
    if (typeof window === 'undefined' || !window.gtag || !GA_ID) return;
    window.gtag('config', GA_ID, { page_path: url });
}

/**
 * Track a custom event.
 *
 * @param action   - GA4 event name, e.g. 'add_to_cart'
 * @param category - Logical grouping, e.g. 'cart', 'engagement'
 * @param label    - Optional descriptor, e.g. product name
 * @param value    - Optional numeric value, e.g. order total
 */
export function trackEvent(
    action: string,
    category: string,
    label?: string,
    value?: number,
): void {
    if (typeof window === 'undefined' || !window.gtag || !GA_ID) return;
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
    });
}

'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GA_ID, pageview } from '@/lib/analytics';

/**
 * Google Analytics (GA4) loader + SPA page-view tracker.
 *
 * - Loads gtag.js via next/script (afterInteractive → non-blocking)
 * - Initialises dataLayer + config
 * - Fires a pageview on every client-side route change
 * - Renders nothing when GA_ID is missing (dev/preview safety)
 */
export default function GoogleAnalytics() {
    const pathname = usePathname();

    // Track SPA navigations
    useEffect(() => {
        if (pathname) pageview(pathname);
    }, [pathname]);

    // Skip entirely when GA is not configured
    if (!GA_ID) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script
                id="ga4-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_ID}', { page_path: window.location.pathname });
                    `,
                }}
            />
        </>
    );
}

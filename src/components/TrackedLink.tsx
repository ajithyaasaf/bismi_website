'use client';

import { trackEvent } from '@/lib/analytics';

/**
 * Wrapper for external links that need analytics click-tracking.
 * Renders a plain <a> tag with an onClick handler that fires the
 * specified event. Useful inside server components that cannot
 * attach event handlers directly.
 */
export default function TrackedLink({
    href,
    eventAction,
    eventCategory,
    eventLabel,
    children,
    ...rest
}: {
    href: string;
    eventAction: string;
    eventCategory: string;
    eventLabel?: string;
    children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
    return (
        <a
            href={href}
            onClick={() => trackEvent(eventAction, eventCategory, eventLabel)}
            {...rest}
        >
            {children}
        </a>
    );
}

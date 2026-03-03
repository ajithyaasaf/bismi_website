'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/config';

type CategoryId = (typeof CATEGORIES)[number]['id'];

/**
 * Renders category cards for the homepage.
 * Runs a lightweight limit(1) Firestore query per category in parallel
 * to determine which categories have at least one active product.
 *
 * Fail-safe: if Firestore is unreachable, all categories are shown
 * so the shop is never blocked.
 */
export default function CategoryGrid() {
    // null = not yet checked; true/false = result
    const [visibleIds, setVisibleIds] = useState<Set<CategoryId> | null>(null);

    useEffect(() => {
        if (!isFirebaseConfigured) {
            // Firebase not configured — show all categories
            setVisibleIds(new Set(CATEGORIES.map((c) => c.id)));
            return;
        }

        let cancelled = false;

        async function checkVisibility() {
            try {
                const checks = await Promise.all(
                    CATEGORIES.map(async (cat) => {
                        const q = query(
                            collection(db, 'meatTypes'),
                            where('category', '==', cat.id),
                            where('isActive', '==', true),
                            limit(1)
                        );
                        const snap = await getDocs(q);
                        return { id: cat.id, hasActive: !snap.empty };
                    })
                );

                if (cancelled) return;

                const visible = new Set<CategoryId>(
                    checks.filter((c) => c.hasActive).map((c) => c.id)
                );
                setVisibleIds(visible);
            } catch {
                // Fail-safe: show all categories if check fails
                if (!cancelled) {
                    setVisibleIds(new Set(CATEGORIES.map((c) => c.id)));
                }
            }
        }

        checkVisibility();
        return () => { cancelled = true; };
    }, []);

    // While checking, render skeleton placeholders matching exact card dimensions
    if (visibleIds === null) {
        return (
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto sm:max-w-none sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.id}
                        className="rounded-2xl p-5 sm:p-6 border border-gray-100 bg-gray-50 animate-pulse"
                    >
                        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 bg-gray-200 rounded-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto hidden sm:block" />
                    </div>
                ))}
            </div>
        );
    }

    const visibleCategories = CATEGORIES.filter((cat) => visibleIds.has(cat.id));

    if (visibleCategories.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🛑</div>
                <p className="font-medium text-gray-600">No items available today</p>
                <p className="text-sm mt-1">Please check back later or call us directly.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto sm:max-w-none sm:grid-cols-2">
            {visibleCategories.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/menu?category=${cat.id}`}
                    className="group relative bg-white rounded-2xl p-5 sm:p-6 text-center border border-gray-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 transition-all active:scale-[0.97]"
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 relative drop-shadow-sm group-hover:scale-110 transition-transform">
                        <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 96px, 128px"
                        />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{cat.name}</h3>
                    <p className="text-xs text-gray-400 hidden sm:block">{cat.description}</p>
                </Link>
            ))}
        </div>
    );
}

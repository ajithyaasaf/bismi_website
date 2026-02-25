'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { MeatType } from '@/types';

/**
 * Renders a horizontal strip showing today's available meat products.
 * Queries meatTypes where todayAvailable == true.
 * Fails silently if no data or fields are missing.
 */
export default function TodayAvailableStrip() {
    const [items, setItems] = useState<MeatType[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function fetchAvailable() {
            if (!isFirebaseConfigured) return;
            try {
                const q = query(
                    collection(db, 'meatTypes'),
                    where('todayAvailable', '==', true),
                    where('isActive', '==', true)
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as MeatType[];
                setItems(results);
            } catch {
                // Fail silently — strip is non-critical
            } finally {
                setLoaded(true);
            }
        }

        fetchAvailable();
    }, []);

    // Don't render anything until loaded, and nothing if empty
    if (!loaded || items.length === 0) return null;

    return (
        <section className="bg-green-50 border-y border-green-100">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
                    {/* Label */}
                    <span className="shrink-0 text-xs font-bold text-green-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        Fresh Today
                    </span>

                    <span className="shrink-0 w-px h-4 bg-green-200" />

                    {/* Items */}
                    {items.map((item) => (
                        <span
                            key={item.id}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-medium text-green-800"
                        >
                            {item.name}
                            {item.todayLabel && (
                                <span className="text-green-500 font-normal">· {item.todayLabel}</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

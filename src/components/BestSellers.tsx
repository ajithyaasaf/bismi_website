'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { MeatType } from '@/types';
import ProductCard from './ProductCard';
import Link from 'next/link';

// ── Pinned best-seller names — edit this list to change what shows ────────────
const BEST_SELLER_NAMES = [
    'Chicken Curry Cut',
    'Chicken Biriyani Cut',
    'Chicken Boneless',
    'Country Chicken (Naatu Kozhi)',
];

export default function BestSellers() {
    const [products, setProducts] = useState<MeatType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchBestSellers() {
            if (!isFirebaseConfigured) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch exactly the pinned flagship cuts — no random ordering
                const q = query(
                    collection(db, 'meatTypes'),
                    where('name', 'in', BEST_SELLER_NAMES),
                    where('isActive', '==', true),
                );

                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as MeatType[];

                // Preserve pinned display order
                const ordered = BEST_SELLER_NAMES
                    .map(name => fetched.find(p => p.name === name))
                    .filter(Boolean) as MeatType[];

                if (isMounted) setProducts(ordered);
            } catch (error) {
                console.error('Error fetching best sellers:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchBestSellers();
        return () => { isMounted = false; };
    }, []);

    if (isLoading) {
        return (
            <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Weekly Best Sellers</h2>
                        <p className="text-gray-500 text-sm sm:text-base">Customer favorites, cut fresh every day</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-50 animate-pulse rounded-2xl aspect-[3/4] border border-gray-100" />
                    ))}
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12 border-b border-gray-100">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 tracking-tight">Weekly Best Sellers</h2>
                    <p className="text-gray-500 text-sm sm:text-base">Customer favorites, cut fresh every day</p>
                </div>
                <Link
                    href="/menu"
                    className="hidden sm:inline-flex items-center gap-1 text-red-600 font-semibold text-sm hover:text-red-700 transition-colors"
                >
                    View All items
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mb-0.5">
                        <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Mobile View All button */}
            <div className="mt-6 sm:hidden text-center">
                <Link
                    href="/menu"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                >
                    View All Menu Items
                </Link>
            </div>
        </section>
    );
}

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { MeatType } from '@/types';
import { CATEGORIES } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

function MenuContent() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');

    const [products, setProducts] = useState<MeatType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(categoryFilter);

    useEffect(() => {
        async function fetchProducts() {
            if (!isFirebaseConfigured) {
                setError('Firebase is not configured. Please add your Firebase credentials.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                // Simple query — no orderBy needed (avoids composite index requirement)
                let q;
                if (activeCategory) {
                    q = query(
                        collection(db, 'meatTypes'),
                        where('isActive', '==', true),
                        where('category', '==', activeCategory),
                    );
                } else {
                    q = query(
                        collection(db, 'meatTypes'),
                        where('isActive', '==', true),
                    );
                }

                const snapshot = await getDocs(q);
                const items: MeatType[] = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }) as MeatType)
                    .sort((a, b) => a.name.localeCompare(b.name)); // sort client-side

                setProducts(items);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Unable to load menu. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [activeCategory]);


    return (
        <>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Our Menu</h1>
                <p className="text-sm text-gray-500">Fresh cuts, sourced daily</p>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-4 px-4">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all ${!activeCategory
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
                        }`}
                >
                    All
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all ${activeCategory === cat.id
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
                            }`}
                    >
                        {cat.emoji} {cat.name}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            {loading ? (
                <LoadingSpinner text="Loading menu..." />
            ) : error ? (
                <div className="text-center py-16">
                    <div className="text-4xl mb-3">😕</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-600 mb-2">No products found</p>
                    <p className="text-sm text-gray-400">
                        {activeCategory ? 'Try selecting a different category' : 'Menu items coming soon!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </>
    );
}

export default function MenuPage() {
    return (
        <>
            <Header />
            <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
                <Suspense fallback={<LoadingSpinner text="Loading menu..." />}>
                    <MenuContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

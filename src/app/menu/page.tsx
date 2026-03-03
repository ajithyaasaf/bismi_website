'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { MeatType } from '@/types';
import { CATEGORIES, CHICKEN_GROUPS } from '@/lib/config';
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

                // Query only by category (UI will filter out inactive ones)
                let q;
                if (activeCategory) {
                    q = query(
                        collection(db, 'meatTypes'),
                        where('category', '==', activeCategory),
                    );
                } else {
                    q = query(
                        collection(db, 'meatTypes'),
                    );
                }

                const snapshot = await getDocs(q);
                // Filter isActive dynamically
                const items: MeatType[] = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }) as MeatType)
                    .filter((item) => item.isActive !== false) // Do not render permanently inactive items
                    .sort((a, b) => a.name.localeCompare(b.name));

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

    // Grouping Logic for "chicken" category
    const renderProducts = () => {
        if (products.length === 0) {
            // Show a specific "not available today" message when querying a category
            if (activeCategory) {
                return (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">🛑</div>
                        <p className="font-semibold text-gray-700 mb-1">Not available today</p>
                        <p className="text-sm text-gray-400 mb-6">
                            This category has no items available at the moment.<br />
                            Please check back later or try another category.
                        </p>
                        <button
                            onClick={() => setActiveCategory(null)}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                        >
                            View all categories
                        </button>
                    </div>
                );
            }
            return (
                <div className="text-center py-16">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-600 mb-2">No products found</p>
                    <p className="text-sm text-gray-400">Menu items coming soon!</p>
                </div>
            );
        }

        // If not filtering by chicken specifically, render flat list
        if (activeCategory !== 'chicken') {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            );
        }

        // Group chicken products
        const groupedProducts: Record<string, MeatType[]> = {};
        const unassignedProducts: MeatType[] = [];

        // Initialize groups
        CHICKEN_GROUPS.forEach(group => {
            groupedProducts[group.label] = [];
        });

        // Assign products to groups
        products.forEach(product => {
            let assigned = false;
            for (const group of CHICKEN_GROUPS) {
                if (group.names.includes(product.name)) {
                    groupedProducts[group.label].push(product);
                    assigned = true;
                    break;
                }
            }
            if (!assigned) {
                unassignedProducts.push(product);
            }
        });

        return (
            <div className="space-y-8 sm:space-y-10">
                {CHICKEN_GROUPS.map(group => {
                    const groupItems = groupedProducts[group.label];
                    if (groupItems.length === 0) return null;

                    // Ensure items render in the exact order defined in the config array
                    const orderedItems = [...groupItems].sort((a, b) =>
                        group.names.indexOf(a.name) - group.names.indexOf(b.name)
                    );

                    return (
                        <div key={group.label} className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 shrink-0">{group.label}</h2>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                {orderedItems.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Render any unrecognized chicken items in an 'Others' section */}
                {unassignedProducts.length > 0 && (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 shrink-0">Other Cuts</h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {unassignedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Our Menu</h1>
                <p className="text-sm text-gray-500">Fresh cuts, sourced daily</p>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all ${!activeCategory
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
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
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
                            }`}
                    >
                        {cat.emoji} {cat.name}
                    </button>
                ))}
            </div>

            {/* Products Content */}
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
            ) : (
                renderProducts()
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

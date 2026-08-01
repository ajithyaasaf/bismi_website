'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { MeatType } from '@/types';
import { CATEGORIES, CHICKEN_GROUPS } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ProductCardSkeleton';
import { trackEvent } from '@/lib/analytics';

function MenuContent() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');

    const [products, setProducts] = useState<MeatType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(categoryFilter);
    const [notified, setNotified] = useState(false);

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
                const items: MeatType[] = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }) as MeatType)
                    .filter((item) => item.isActive !== false)
                    .sort((a, b) => a.name.localeCompare(b.name));

                setProducts(items);
                trackEvent('view_menu', 'engagement', activeCategory ?? 'all');
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Unable to load menu. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [activeCategory]);

    const handleNotifyClick = () => {
        setNotified(true);
        setTimeout(() => setNotified(false), 4000);
    };

    // Category display list including active deep-linked ones like "mutton"
    const categoryOptions = [
        { id: null, name: 'All', emoji: '' },
        ...CATEGORIES.map(c => ({ id: c.id as string | null, name: c.name, emoji: c.emoji })),
    ];

    // If activeCategory is not in CATEGORIES (e.g. mutton), add it dynamically
    if (activeCategory && !categoryOptions.some(c => c.id === activeCategory)) {
        const formattedName = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
        categoryOptions.push({ id: activeCategory, name: formattedName, emoji: '🥩' });
    }

    const renderProducts = () => {
        if (products.length === 0) {
            // Coming Soon / Not Available Card Design
            return (
                <div className="relative max-w-4xl mx-auto my-6 sm:my-10 px-2 sm:px-4">
                    {/* Outer Card Container */}
                    <div className="relative bg-white/90 backdrop-blur-md rounded-[32px] sm:rounded-[40px] border border-red-100 shadow-xl shadow-red-500/5 p-6 sm:p-12 text-center overflow-hidden">
                        
                        {/* Dashed Inner Frame */}
                        <div className="border-2 border-dashed border-red-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-12 flex flex-col items-center justify-center">
                            
                            {/* Center Illustration */}
                            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-4 sm:mb-6 transition-transform duration-500 hover:scale-105">
                                <Image
                                    src="/assets/images/coming-soon-box.png"
                                    alt="Coming Soon Box Illustration"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {/* Heading */}
                            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-3">
                                Coming <span className="text-[#d90429]">Soon!</span>
                            </h2>

                            {/* Heart Line Divider */}
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-red-200 to-red-400" />
                                <span className="text-red-500 text-sm">♥</span>
                                <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-l from-transparent via-red-200 to-red-400" />
                            </div>

                            {/* Subtitle Message */}
                            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6 font-medium">
                                We&apos;re preparing something fresh and delicious for you.<br className="hidden sm:inline" />
                                This category will be available very soon.
                            </p>

                            {/* Action Button */}
                            <button
                                onClick={handleNotifyClick}
                                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#d90429] hover:bg-[#b80323] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {notified ? "We'll notify you!" : "Notify me when it's available"}
                            </button>

                            {/* Feedback Toast */}
                            {notified && (
                                <div className="mt-4 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full animate-fade-in">
                                    ✓ Thanks! We will update you as soon as this item arrives.
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            );
        }

        if (activeCategory !== 'chicken') {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            );
        }

        const groupedProducts: Record<string, MeatType[]> = {};
        const unassignedProducts: MeatType[] = [];

        CHICKEN_GROUPS.forEach(group => {
            groupedProducts[group.label] = [];
        });

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
        <div className="relative overflow-hidden min-h-[80vh] pb-12">
            
            {/* ─── Background Corner Decoration (Only for Empty / Coming Soon State) ─── */}
            {!loading && products.length === 0 && (
                <>
                    {/* Top Right Raw Meat Bowl (Reduced Size) */}
                    <div className="absolute top-0 right-0 z-0 pointer-events-none w-24 sm:w-36 lg:w-44 opacity-90">
                        <Image
                            src="/assets/images/menu-section2/raw-meat-bowl.png"
                            alt="Raw Meat Bowl Accent"
                            width={250}
                            height={250}
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    {/* Subtle Pink Backdrop Circle */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
                </>
            )}

            {/* ─── Page Header ─── */}
            <div className="relative z-10 text-center pt-4 sm:pt-8 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight mb-2">
                    Our Menu
                </h1>

                {/* Heart Line Accent */}
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-red-200 to-red-400" />
                    <span className="text-red-500 text-sm">♥</span>
                    <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-l from-transparent via-red-200 to-red-400" />
                </div>

                <p className="text-xs sm:text-base text-gray-500 font-medium">
                    Fresh cuts, sourced daily
                </p>
            </div>

            {/* ─── Category Filter Pills ─── */}
            <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 flex-wrap pb-2 mb-8 px-4">
                {categoryOptions.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id ?? 'all'}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
                                isActive
                                    ? 'bg-[#d90429] text-white shadow-md shadow-red-500/20 scale-105'
                                    : 'bg-white text-gray-700 border border-gray-200/80 hover:border-red-300 hover:text-red-600 hover:bg-red-50/50'
                            }`}
                        >
                            {cat.id === null && (
                                <svg className="w-4 h-4 text-current" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 002-2h2a2 2 0 002 2v2a2 2 0 00-2 2h-2a2 2 0 00-2-2V5zM11 13a2 2 0 002-2h2a2 2 0 002 2v2a2 2 0 00-2 2h-2a2 2 0 00-2-2v-2z" />
                                </svg>
                            )}
                            {cat.emoji && <span className="text-base">{cat.emoji}</span>}
                            <span>{cat.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* ─── Main Products / Coming Soon Content ─── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {loading ? (
                    <div className="space-y-6">
                        <ProductGridSkeleton count={8} />
                    </div>
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
            </div>
        </div>
    );
}

export default function MenuPage() {
    return (
        <>
            <Header />
            <main className="flex-1">
                <Suspense fallback={<ProductGridSkeleton count={8} className="max-w-7xl mx-auto px-4 mt-8" />}>
                    <MenuContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

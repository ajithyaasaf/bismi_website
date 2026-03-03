'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { MeatType } from '@/types';

type ProductRow = MeatType & {
    togglingActive?: boolean;
    togglingAvailable?: boolean;
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const q = query(collection(db, 'meatTypes'), orderBy('name'));
            const snapshot = await getDocs(q);
            const items: ProductRow[] = snapshot.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<MeatType, 'id'>),
            }));
            setProducts(items);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products. Please refresh.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleToggleActive = async (id: string, currentValue: boolean) => {
        const newValue = !currentValue;

        // Optimistic update
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isActive: newValue, togglingActive: true } : p))
        );

        try {
            await updateDoc(doc(db, 'meatTypes', id), { isActive: newValue });
        } catch (err) {
            console.error('Failed to update product isActive:', err);
            // Revert on error
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, isActive: currentValue, togglingActive: false } : p))
            );
        } finally {
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, togglingActive: false } : p))
            );
        }
    };

    const handleToggleAvailable = async (id: string, currentValue: boolean) => {
        const newValue = !currentValue;

        // Optimistic update
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isAvailableToday: newValue, togglingAvailable: true } : p))
        );

        try {
            await updateDoc(doc(db, 'meatTypes', id), { isAvailableToday: newValue });
        } catch (err) {
            console.error('Failed to update product isAvailableToday:', err);
            // Revert on error
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, isAvailableToday: currentValue, togglingAvailable: false } : p))
            );
        } finally {
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, togglingAvailable: false } : p))
            );
        }
    };

    const activeCount = products.filter((p) => p.isActive).length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-400">
                        {loading ? 'Loading…' : `${activeCount} of ${products.length} active`}
                    </p>
                </div>
                <button
                    onClick={fetchProducts}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {loading ? '…' : '↻ Refresh'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && products.length === 0 && (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/5" />
                            </div>
                            <div className="w-12 h-6 bg-gray-100 rounded-full" />
                        </div>
                    ))}
                </div>
            )}

            {/* Product list */}
            {!loading && products.length === 0 && !error && (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📦</div>
                    <p>No products found.</p>
                </div>
            )}

            <div className="space-y-2">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-all ${product.isActive
                            ? 'border-gray-100'
                            : 'border-gray-100 opacity-60'
                            }`}
                    >
                        {/* Image */}
                        <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-50 shrink-0">
                            {product.imageURL ? (
                                <Image
                                    src={product.imageURL}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">🥩</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-400 capitalize">
                                {product.category}
                                {' · '}
                                {product.unit === 'kg'
                                    ? `₹${product.pricePerKg}/kg`
                                    : `₹${product.pricePerPiece}/pc`}
                            </p>
                        </div>

                        {/* Active badge */}
                        <span
                            className={`hidden sm:inline-flex shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${product.isActive
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                                }`}
                        >
                            {product.isActive ? 'Active' : 'Inactive'}
                        </span>

                        {/* Toggle switches wrapper */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 ml-2 sm:ml-4">
                            {/* Active Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Catalog</span>
                                <button
                                    role="switch"
                                    aria-checked={product.isActive}
                                    aria-label={`Toggle active for ${product.name}`}
                                    disabled={product.togglingActive}
                                    onClick={() => handleToggleActive(product.id, product.isActive)}
                                    className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 ${product.isActive ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.isActive ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Available Today Toggle */}
                            {product.isActive ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Today</span>
                                    <button
                                        role="switch"
                                        aria-checked={product.isAvailableToday !== false} // Treats undefined as true
                                        aria-label={`Toggle availability for ${product.name}`}
                                        disabled={product.togglingAvailable}
                                        onClick={() => handleToggleAvailable(product.id, product.isAvailableToday !== false)}
                                        className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 ${product.isAvailableToday !== false ? 'bg-blue-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.isAvailableToday !== false ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-[88px] hidden sm:block"></div> // Placeholder to keep alignment when hidden
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

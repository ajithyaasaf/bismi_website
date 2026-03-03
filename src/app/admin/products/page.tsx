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

    // Inline local name editor state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);

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
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isActive: newValue, togglingActive: true } : p))
        );
        try {
            await updateDoc(doc(db, 'meatTypes', id), { isActive: newValue });
        } catch (err) {
            console.error('Failed to update product isActive:', err);
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
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isAvailableToday: newValue, togglingAvailable: true } : p))
        );
        try {
            await updateDoc(doc(db, 'meatTypes', id), { isAvailableToday: newValue });
        } catch (err) {
            console.error('Failed to update product isAvailableToday:', err);
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, isAvailableToday: currentValue, togglingAvailable: false } : p))
            );
        } finally {
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, togglingAvailable: false } : p))
            );
        }
    };

    // ── Local Name Editing ─────────────────────────────────────────────────────
    const startEditing = (id: string, current: string | undefined) => {
        setEditingId(id);
        setEditingValue(current ?? '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingValue('');
    };

    const saveLocalName = async (id: string) => {
        const trimmed = editingValue.trim();
        setSavingId(id);
        try {
            await updateDoc(doc(db, 'meatTypes', id), { localName: trimmed || null });
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, localName: trimmed || undefined } : p))
            );
            setEditingId(null);
        } catch (err) {
            console.error('Failed to save localName:', err);
        } finally {
            setSavingId(null);
        }
    };

    const activeCount = products.filter((p) => p.isActive).length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
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

            {/* Legend */}
            <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span>Catalog — product exists</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Today — orderable today</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-500">ஆ</span>
                    <span>Tap name row to add/edit Tamil name</span>
                </span>
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
                            <div className="w-28 h-6 bg-gray-100 rounded-full" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty */}
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
                        className={`flex items-center gap-3 sm:gap-4 p-4 bg-white rounded-xl border transition-all ${product.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'
                            }`}
                    >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-50 shrink-0">
                            {product.imageURL ? (
                                <Image src={product.imageURL} alt={product.name} fill className="object-cover" sizes="48px" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">🥩</div>
                            )}
                        </div>

                        {/* Info + Tamil name */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-400 capitalize mb-1">
                                {product.category}
                                {' · '}
                                {product.unit === 'kg' ? `₹${product.pricePerKg}/kg` : `₹${product.pricePerPiece}/pc`}
                            </p>

                            {/* Inline Tamil name editor */}
                            {editingId === product.id ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveLocalName(product.id);
                                            if (e.key === 'Escape') cancelEditing();
                                        }}
                                        onBlur={() => saveLocalName(product.id)}
                                        placeholder="e.g. சிக்கன் கறி கட்"
                                        lang="ta"
                                        className="flex-1 min-w-0 text-xs bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-300"
                                    />
                                    <button
                                        onMouseDown={(e) => { e.preventDefault(); saveLocalName(product.id); }}
                                        disabled={savingId === product.id}
                                        className="shrink-0 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                        {savingId === product.id ? '…' : '✓'}
                                    </button>
                                    <button
                                        onMouseDown={(e) => { e.preventDefault(); cancelEditing(); }}
                                        className="shrink-0 text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5 rounded-lg transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => startEditing(product.id, product.localName)}
                                    className="group/ta flex items-center gap-1 mt-0.5 text-left"
                                    title="Click to edit Tamil name"
                                >
                                    {product.localName ? (
                                        <span className="text-xs font-medium text-red-500/80" lang="ta">{product.localName}</span>
                                    ) : (
                                        <span className="text-[10px] text-gray-300 group-hover/ta:text-amber-500 transition-colors">+ add Tamil name</span>
                                    )}
                                    <span className="text-[10px] text-gray-200 group-hover/ta:text-amber-400 transition-colors pl-0.5">✏</span>
                                </button>
                            )}
                        </div>

                        {/* Active badge (desktop) */}
                        <span className={`hidden sm:inline-flex shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                        </span>

                        {/* Toggles */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 ml-1 sm:ml-4">
                            {/* Catalog toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Catalog</span>
                                <button
                                    role="switch"
                                    aria-checked={product.isActive}
                                    aria-label={`Toggle active for ${product.name}`}
                                    disabled={product.togglingActive}
                                    onClick={() => handleToggleActive(product.id, product.isActive)}
                                    className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 ${product.isActive ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.isActive ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            {/* Today toggle */}
                            {product.isActive ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Today</span>
                                    <button
                                        role="switch"
                                        aria-checked={product.isAvailableToday !== false}
                                        aria-label={`Toggle availability for ${product.name}`}
                                        disabled={product.togglingAvailable}
                                        onClick={() => handleToggleAvailable(product.id, product.isAvailableToday !== false)}
                                        className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 ${product.isAvailableToday !== false ? 'bg-blue-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.isAvailableToday !== false ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-[88px] hidden sm:block" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

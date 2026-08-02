'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { MeatType } from '@/types';
import AddProductModal from '@/components/admin/AddProductModal';

type ProductRow = MeatType & {
    togglingActive?: boolean;
    togglingAvailable?: boolean;
};

const ITEMS_PER_PAGE = 8;

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Inline Tamil name editor state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);

    // Dynamic Price editor state
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [editingPriceValue, setEditingPriceValue] = useState('');
    const [savingPriceId, setSavingPriceId] = useState<string | null>(null);

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

    // Reset pagination when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

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

    // ── Dynamic Price Editing ──────────────────────────────────────────────────
    const startPriceEditing = (product: MeatType) => {
        setEditingPriceId(product.id);
        const currentVal = product.unit === 'kg' ? product.pricePerKg : product.pricePerPiece;
        setEditingPriceValue(currentVal ? String(currentVal) : '');
    };

    const cancelPriceEditing = () => {
        setEditingPriceId(null);
        setEditingPriceValue('');
    };

    const savePrice = async (product: MeatType) => {
        const parsedPrice = parseFloat(editingPriceValue);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            alert('Please enter a valid price greater than ₹0');
            cancelPriceEditing();
            return;
        }

        setSavingPriceId(product.id);
        try {
            const updatePayload =
                product.unit === 'kg'
                    ? { pricePerKg: parsedPrice }
                    : { pricePerPiece: parsedPrice };

            await updateDoc(doc(db, 'meatTypes', product.id), updatePayload);

            setProducts((prev) =>
                prev.map((p) => {
                    if (p.id !== product.id) return p;
                    return product.unit === 'kg'
                        ? { ...p, pricePerKg: parsedPrice }
                        : { ...p, pricePerPiece: parsedPrice };
                })
            );
            setEditingPriceId(null);
        } catch (err) {
            console.error('Failed to update price:', err);
            alert('Failed to update price in database.');
        } finally {
            setSavingPriceId(null);
        }
    };

    // ── Filtering & Searching ──────────────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            // Category Filter
            if (selectedCategory !== 'all') {
                if (selectedCategory === 'active') {
                    if (!p.isActive) return false;
                } else if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
                    return false;
                }
            }

            // Search Query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const nameMatch = p.name.toLowerCase().includes(q);
                const localMatch = p.localName ? p.localName.toLowerCase().includes(q) : false;
                const categoryMatch = p.category.toLowerCase().includes(q);
                return nameMatch || localMatch || categoryMatch;
            }

            return true;
        });
    }, [products, selectedCategory, searchQuery]);

    // ── Pagination Calculation ────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const activeCount = products.filter((p) => p.isActive).length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products & Menu</h1>
                    <p className="text-sm text-gray-400">
                        {loading ? 'Loading…' : `${activeCount} of ${products.length} active items`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
                    >
                        <span>+</span> Add Product
                    </button>

                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {loading ? '…' : '↻ Refresh'}
                    </button>
                </div>
            </div>

            {/* Legend & Controls */}
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span>Catalog — website active</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Today — orderable today</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="font-bold text-red-600">₹</span>
                    <span>Tap price tag to update price instantly</span>
                </span>
            </div>

            {/* ── Search Bar & Category Filter Bar ── */}
            <div className="mb-5 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products by name (e.g. Chicken, Beef, ஆட்டுக்கறி)..."
                            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none transition-all placeholder:text-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">Filter:</span>
                    {[
                        { id: 'all', label: 'All Items' },
                        { id: 'active', label: 'Active Only' },
                        { id: 'chicken', label: 'Chicken' },
                        { id: 'mutton', label: 'Mutton' },
                        { id: 'beef', label: 'Beef' },
                        { id: 'specialty', label: 'Specialty' },
                        { id: 'seafood', label: 'Seafood' },
                        { id: 'eggs', label: 'Eggs' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
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

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && !error && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-700 font-bold mb-1">
                        {searchQuery || selectedCategory !== 'all'
                            ? 'No products match your search or filter.'
                            : 'No products found in catalog.'}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                        {searchQuery || selectedCategory !== 'all'
                            ? 'Try clearing your search query or selecting a different category filter.'
                            : 'Click below to add your first product.'}
                    </p>
                    {searchQuery || selectedCategory !== 'all' ? (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Reset Filters
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md"
                        >
                            + Add First Product
                        </button>
                    )}
                </div>
            )}

            {/* Product Items List */}
            <div className="space-y-2.5 mb-6">
                {paginatedProducts.map((product) => {
                    const currentPrice = product.unit === 'kg' ? product.pricePerKg : product.pricePerPiece;

                    return (
                        <div
                            key={product.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border transition-all ${
                                product.isActive ? 'border-gray-100 shadow-2xs' : 'border-gray-100 opacity-60 bg-gray-50/50'
                            }`}
                        >
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                {/* Thumbnail */}
                                <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                    {product.imageURL ? (
                                        <Image src={product.imageURL} alt={product.name} fill className="object-cover" sizes="48px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">🥩</div>
                                    )}
                                </div>

                                {/* Info + Tamil Name + Dynamic Price Editor */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                            {product.category}
                                        </span>
                                    </div>

                                    {/* Price Line & Inline Editor */}
                                    <div className="mt-1 flex items-center gap-2 text-xs">
                                        {editingPriceId === product.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-gray-700">₹</span>
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    step="1"
                                                    min="1"
                                                    value={editingPriceValue}
                                                    onChange={(e) => setEditingPriceValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') savePrice(product);
                                                        if (e.key === 'Escape') cancelPriceEditing();
                                                    }}
                                                    className="w-20 text-xs font-bold bg-amber-50 border border-amber-400 text-gray-900 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500"
                                                />
                                                <span className="text-gray-400 font-medium">/{product.unit}</span>
                                                <button
                                                    onClick={() => savePrice(product)}
                                                    disabled={savingPriceId === product.id}
                                                    className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md transition-colors"
                                                >
                                                    {savingPriceId === product.id ? '…' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={cancelPriceEditing}
                                                    className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startPriceEditing(product)}
                                                className="group/price flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg border border-red-200 transition-colors"
                                                title="Click to edit price"
                                            >
                                                <span>₹{currentPrice}/{product.unit}</span>
                                                <span className="text-[10px] text-red-400 group-hover/price:text-red-600">✏</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Inline Tamil Name Editor */}
                                    <div className="mt-1">
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
                                                    className="flex-1 min-w-0 text-xs bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-300"
                                                />
                                                <button
                                                    onMouseDown={(e) => { e.preventDefault(); saveLocalName(product.id); }}
                                                    disabled={savingId === product.id}
                                                    className="shrink-0 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors"
                                                >
                                                    {savingId === product.id ? '…' : '✓'}
                                                </button>
                                                <button
                                                    onMouseDown={(e) => { e.preventDefault(); cancelEditing(); }}
                                                    className="shrink-0 text-xs text-gray-400 hover:text-gray-700 px-1.5 py-1 rounded-lg transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEditing(product.id, product.localName)}
                                                className="group/ta flex items-center gap-1 text-left"
                                                title="Click to edit Tamil name"
                                            >
                                                {product.localName ? (
                                                    <span className="text-xs font-medium text-red-500/80" lang="ta">{product.localName}</span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 group-hover/ta:text-amber-500 transition-colors">+ add Tamil name</span>
                                                )}
                                                <span className="text-[10px] text-gray-300 group-hover/ta:text-amber-400 transition-colors pl-0.5">✏</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Toggles (Catalog + Today) */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0 border-gray-100">
                                {/* Catalog toggle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Catalog</span>
                                    <button
                                        role="switch"
                                        aria-checked={product.isActive}
                                        aria-label={`Toggle active for ${product.name}`}
                                        disabled={product.togglingActive}
                                        onClick={() => handleToggleActive(product.id, product.isActive)}
                                        className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 ${
                                            product.isActive ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                            product.isActive ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>

                                {/* Today toggle */}
                                {product.isActive ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Today</span>
                                        <button
                                            role="switch"
                                            aria-checked={product.isAvailableToday !== false}
                                            aria-label={`Toggle availability for ${product.name}`}
                                            disabled={product.togglingAvailable}
                                            onClick={() => handleToggleAvailable(product.id, product.isAvailableToday !== false)}
                                            className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 ${
                                                product.isAvailableToday !== false ? 'bg-blue-500' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                product.isAvailableToday !== false ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-[88px] hidden sm:block" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Pagination Controls ── */}
            {filteredProducts.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                    <p className="text-xs font-semibold text-gray-500">
                        Showing{' '}
                        <span className="text-gray-900 font-bold">
                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{' '}
                        to{' '}
                        <span className="text-gray-900 font-bold">
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                        </span>{' '}
                        of <span className="text-gray-900 font-bold">{filteredProducts.length}</span> items
                    </p>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                            ← Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-xs font-bold rounded-xl transition-all ${
                                    currentPage === page
                                        ? 'bg-red-600 text-white shadow-xs scale-105'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onProductAdded={fetchProducts}
            />
        </div>
    );
}

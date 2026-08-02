'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    collection, query, where, orderBy, limit, getDocs, QueryConstraint,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/config';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

const ITEMS_PER_PAGE = 10;

function OrdersContent() {
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status') as OrderStatus | null;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>(statusFilter || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOrders = useCallback(async () => {
        if (!isFirebaseConfigured) return;

        try {
            setLoading(true);

            const constraints: QueryConstraint[] = [];
            if (activeStatus !== 'all') {
                constraints.push(where('status', '==', activeStatus));
            }

            constraints.push(orderBy('createdAt', 'desc'));
            constraints.push(limit(150)); // Fetch up to 150 recent orders for fast client filtering & pagination

            const q = query(collection(db, 'orders'), ...constraints);
            const snapshot = await getDocs(q);

            const fetchedOrders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Order[];

            setOrders(fetchedOrders);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    }, [activeStatus]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Reset to page 1 whenever search query or status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeStatus]);

    // ── Search & Filter Logic ────────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase().trim();
            const nameMatch = order.customerName.toLowerCase().includes(q);
            const mobileMatch = order.mobile.includes(q);
            const idMatch = order.id.toLowerCase().includes(q);
            const zoneMatch = order.deliveryZoneLabel ? order.deliveryZoneLabel.toLowerCase().includes(q) : false;

            return nameMatch || mobileMatch || idMatch || zoneMatch;
        });
    }, [orders, searchQuery]);

    // ── Pagination Logic ─────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    return (
        <>
            {/* Search Bar & Status Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-2xs space-y-3">
                {/* Search Input */}
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by customer name, mobile number, or order ID..."
                        className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none transition-all placeholder:text-gray-400"
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

                {/* Status Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider my-auto mr-1 shrink-0">Status:</span>
                    {['all', ...Object.values(OrderStatus)].map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveStatus(status as OrderStatus | 'all')}
                            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
                                activeStatus === status
                                    ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {status === 'all' ? 'All Orders' : STATUS_CONFIG[status as OrderStatus]?.label || status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <LoadingSpinner text="Loading orders..." />
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-900 font-bold mb-1">
                        {searchQuery ? 'No matching orders found' : 'No orders found'}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                        {searchQuery
                            ? 'Try searching with a different customer name, phone number, or order ID.'
                            : 'Orders will appear here automatically when customers place them.'}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-2.5 mb-6">
                    {paginatedOrders.map((order) => {
                        const statusConf = STATUS_CONFIG[order.status];
                        return (
                            <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-red-200 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-gray-900 truncate">{order.customerName}</h3>
                                            <span className={`shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusConf.color}`}>
                                                {statusConf.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            📞 +91 {order.mobile} · {order.items.length} items · <span className="capitalize">{order.deliveryType}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {formatShortDate(order.createdAt)}
                                            {order.deliveryZoneLabel && ` · Zone: ${order.deliveryZoneLabel}`}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">#{order.id.slice(-6)}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && filteredOrders.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                    <p className="text-xs font-semibold text-gray-500">
                        Showing{' '}
                        <span className="text-gray-900 font-bold">
                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{' '}
                        to{' '}
                        <span className="text-gray-900 font-bold">
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                        </span>{' '}
                        of <span className="text-gray-900 font-bold">{filteredOrders.length}</span> orders
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
                            className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default function AdminOrdersPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
                <p className="text-sm text-gray-400">Manage and track all customer orders</p>
            </div>

            <Suspense fallback={<LoadingSpinner text="Loading orders..." />}>
                <OrdersContent />
            </Suspense>
        </div>
    );
}

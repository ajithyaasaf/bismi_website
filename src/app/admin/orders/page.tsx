'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    collection, query, where, orderBy, limit, startAfter, getDocs,
    QueryConstraint, DocumentSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/config';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

const PAGE_SIZE = 15;

function OrdersContent() {
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status') as OrderStatus | null;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>(statusFilter || 'all');
    const [searchMobile, setSearchMobile] = useState('');
    const [searchMode, setSearchMode] = useState(false);

    const fetchOrders = useCallback(async (isLoadMore = false, statusOverride?: OrderStatus | 'all') => {
        if (!isFirebaseConfigured) return;

        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const constraints: QueryConstraint[] = [];
            const currentStatus = statusOverride ?? activeStatus;

            if (currentStatus !== 'all') {
                constraints.push(where('status', '==', currentStatus));
            }

            constraints.push(orderBy('createdAt', 'desc'));

            if (isLoadMore && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            constraints.push(limit(PAGE_SIZE));

            const q = query(collection(db, 'orders'), ...constraints);
            const snapshot = await getDocs(q);

            const newOrders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Order[];

            if (isLoadMore) {
                setOrders((prev) => [...prev, ...newOrders]);
            } else {
                setOrders(newOrders);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [activeStatus, lastDoc]);

    const searchByMobile = async () => {
        if (!searchMobile.trim() || !isFirebaseConfigured) return;
        try {
            setLoading(true);
            setSearchMode(true);
            const q = query(
                collection(db, 'orders'),
                where('mobile', '==', searchMobile.trim()),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const results = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Order[];
            setOrders(results);
            setHasMore(false);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchMobile('');
        setSearchMode(false);
        setLastDoc(null);
        fetchOrders(false, activeStatus);
    };

    useEffect(() => {
        if (!searchMode) {
            setLastDoc(null);
            fetchOrders(false, activeStatus);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStatus]);

    const handleStatusChange = (status: OrderStatus | 'all') => {
        setActiveStatus(status);
        setSearchMode(false);
        setSearchMobile('');
    };

    return (
        <>
            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <div className="flex gap-2">
                    <input
                        type="tel"
                        inputMode="numeric"
                        value={searchMobile}
                        onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="Search by mobile number..."
                        maxLength={10}
                        className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && searchByMobile()}
                    />
                    {searchMode ? (
                        <button
                            onClick={clearSearch}
                            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Clear
                        </button>
                    ) : (
                        <button
                            onClick={searchByMobile}
                            className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                        >
                            Search
                        </button>
                    )}
                </div>
            </div>

            {/* Status Filters */}
            {!searchMode && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                    {['all', ...Object.values(OrderStatus)].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status as OrderStatus | 'all')}
                            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all capitalize ${activeStatus === status
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                                }`}
                        >
                            {status === 'all' ? 'All' : STATUS_CONFIG[status as OrderStatus]?.label || status}
                        </button>
                    ))}
                </div>
            )}

            {/* Orders List */}
            {loading ? (
                <LoadingSpinner text="Loading orders..." />
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-600 mb-1">No orders found</p>
                    <p className="text-sm text-gray-400">
                        {searchMode ? 'Try a different mobile number' : 'Orders will appear here as customers place them'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {orders.map((order) => {
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
                                            <span className={`shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${statusConf.color}`}>
                                                {statusConf.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            +91 {order.mobile} · {order.items.length} items · {order.deliveryType}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {formatShortDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">#{order.id.slice(-6)}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Load More */}
                    {hasMore && !searchMode && (
                        <div className="text-center pt-4">
                            <button
                                onClick={() => fetchOrders(true)}
                                disabled={loadingMore}
                                className="px-6 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
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

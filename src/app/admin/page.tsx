'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrderStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/config';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DashboardStats {
    total: number;
    pending: number;
    accepted: number;
    delivered: number;
    cancelled: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        total: 0, pending: 0, accepted: 0, delivered: 0, cancelled: 0,
    });
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Get start of today
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayTimestamp = Timestamp.fromDate(startOfDay);

            const ordersRef = collection(db, 'orders');
            const todayQuery = query(ordersRef, where('createdAt', '>=', todayTimestamp));
            const snapshot = await getDocs(todayQuery);

            const counts: DashboardStats = {
                total: 0, pending: 0, accepted: 0, delivered: 0, cancelled: 0,
            };

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                counts.total++;
                const status = data.status as OrderStatus;
                if (status === OrderStatus.PENDING) counts.pending++;
                else if (status === OrderStatus.ACCEPTED) counts.accepted++;
                else if (status === OrderStatus.DELIVERED) counts.delivered++;
                else if (status === OrderStatus.CANCELLED) counts.cancelled++;
            });

            setStats(counts);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const STAT_CARDS = [
        { key: 'total', label: 'Total Orders', value: stats.total, color: 'bg-gray-900 text-white', icon: '📦' },
        { key: 'pending', label: 'Pending', value: stats.pending, color: STATUS_CONFIG.pending.color, icon: '⏳' },
        { key: 'accepted', label: 'Accepted', value: stats.accepted, color: STATUS_CONFIG.accepted.color, icon: '✅' },
        { key: 'delivered', label: 'Delivered', value: stats.delivered, color: STATUS_CONFIG.delivered.color, icon: '🚚' },
        { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, color: STATUS_CONFIG.cancelled.color, icon: '❌' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-400">
                        Today&apos;s overview · Last updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {loading ? '...' : '↻ Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            {loading && stats.total === 0 ? (
                <LoadingSpinner text="Loading dashboard..." />
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                        {STAT_CARDS.map((card) => (
                            <div
                                key={card.key}
                                className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5"
                            >
                                <div className="text-2xl mb-2">{card.icon}</div>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/admin/orders?status=pending"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-amber-50 text-amber-700 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                                ⏳ View Pending ({stats.pending})
                            </Link>
                            <Link
                                href="/admin/orders?status=accepted"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                ✅ View Accepted ({stats.accepted})
                            </Link>
                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gray-50 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                📋 All Orders
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

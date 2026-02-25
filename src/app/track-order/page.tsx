'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDate, validateMobile } from '@/lib/utils';
import { STATUS_CONFIG, SHOP_CONFIG } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// The logical flow of order statuses
const STATUS_TIMELINE = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.ACCEPTED,
    OrderStatus.DELIVERED
];

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialMobile = searchParams.get('mobile') || '';

    const [mobile, setMobile] = useState(initialMobile);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // If mobile is in URL, auto-fetch
    useEffect(() => {
        if (initialMobile && validateMobile(initialMobile) && !searched) {
            handleSearch(initialMobile);
        }
    }, [initialMobile]);

    const handleSearch = async (searchMobile: string) => {
        const cleanMobile = searchMobile.replace(/\D/g, '');
        if (!validateMobile(cleanMobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);
        setSearched(true);

        // Update URL to make it shareable/refreshable
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('mobile', cleanMobile);
        window.history.pushState({}, '', newUrl);

        try {
            const q = query(
                collection(db, 'orders'),
                where('mobile', '==', cleanMobile),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setError('No recent orders found for this mobile number.');
            } else {
                setOrder({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order);
            }
        } catch (err) {
            console.error('Failed to track order:', err);
            setError('Could not fetch order status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Track Order</h1>
                    <p className="text-sm text-gray-500">Enter your registered mobile number</p>
                </div>

                {/* Search Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch(mobile);
                    }}
                    className="mb-8"
                >
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">+91</span>
                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter mobile number"
                            disabled={loading}
                            className={`w-full pl-12 pr-24 py-3.5 text-sm border-2 rounded-xl transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-red-500 focus:ring-0'
                                }`}
                        />
                        <button
                            type="submit"
                            disabled={loading || mobile.length !== 10}
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                            ) : (
                                'Track'
                            )}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-xs text-red-500 font-medium text-center">{error}</p>}
                </form>

                {/* Tracking Result */}
                {searched && !loading && order && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Header */}
                        <div className="bg-gray-50 border-b border-gray-100 p-5 text-center">
                            <p className="text-xs text-gray-500 mb-1">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                {order.status === OrderStatus.CANCELLED ? 'Order Cancelled' : 'Arriving Soon'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>

                        {/* Timeline */}
                        {order.status !== OrderStatus.CANCELLED && (
                            <div className="p-6 border-b border-gray-100">
                                <div className="relative pl-4 space-y-6">
                                    {/* Vertical Line */}
                                    <div className="absolute left-6 top-2 bottom-2 w-px bg-gray-100" />

                                    {STATUS_TIMELINE.map((timelineStatus, index) => {
                                        const config = STATUS_CONFIG[timelineStatus];
                                        const currentIndex = STATUS_TIMELINE.indexOf(order.status as OrderStatus);
                                        const isCompleted = index <= currentIndex;
                                        const isCurrent = index === currentIndex;

                                        return (
                                            <div key={timelineStatus} className="relative flex items-center gap-4">
                                                {/* Dot */}
                                                <div
                                                    className={`relative z-10 shrink-0 w-4 h-4 rounded-full border-2 bg-white transition-colors duration-500 ${isCompleted ? 'border-green-500' : 'border-gray-200'
                                                        }`}
                                                >
                                                    {isCompleted && (
                                                        <div className="absolute inset-0.5 bg-green-500 rounded-full" />
                                                    )}
                                                    {isCurrent && (
                                                        <div className="absolute -inset-1.5 border border-green-200 rounded-full animate-ping" />
                                                    )}
                                                </div>

                                                {/* Label */}
                                                <div>
                                                    <p
                                                        className={`text-sm font-semibold transition-colors duration-500 ${isCompleted ? 'text-gray-900' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        {config.label}
                                                    </p>
                                                    {isCurrent && timelineStatus === OrderStatus.PENDING && (
                                                        <p className="text-xs text-gray-500 mt-0.5">We will call you shortly to confirm.</p>
                                                    )}
                                                    {isCurrent && timelineStatus === OrderStatus.CONFIRMED && (
                                                        <p className="text-xs text-gray-500 mt-0.5">Your order is confirmed.</p>
                                                    )}
                                                    {isCurrent && timelineStatus === OrderStatus.ACCEPTED && (
                                                        <p className="text-xs text-gray-500 mt-0.5">Preparing your fresh cuts.</p>
                                                    )}
                                                    {isCurrent && timelineStatus === OrderStatus.DELIVERED && (
                                                        <p className="text-xs text-green-600 mt-0.5">Enjoy your fresh meat!</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Order Summary & Support */}
                        <div className="p-5 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-medium">Payment</p>
                                    <p className="text-sm font-semibold text-gray-900">Cash on Delivery</p>
                                </div>
                            </div>

                            <a
                                href={`https://wa.me/${SHOP_CONFIG.whatsapp}?text=${encodeURIComponent(`Hi, I need help with my order #${order.id.slice(-6).toUpperCase()}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center py-2.5 text-sm font-semibold text-green-700 bg-green-100/50 border border-green-200/50 rounded-xl hover:bg-green-100 transition-colors"
                            >
                                Get Help via WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <span className="block w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
                </main>
                <Footer />
            </div>
        }>
            <TrackOrderContent />
        </Suspense>
    );
}

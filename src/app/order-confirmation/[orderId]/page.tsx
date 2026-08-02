'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { formatCurrency, buildWhatsAppUrl } from '@/lib/utils';
import { SHOP_CONFIG } from '@/lib/config';
import { getPendingOfflineOrder } from '@/lib/offlineQueue';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { trackEvent } from '@/lib/analytics';

export default function OrderConfirmationPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const tracked = useRef(false);

    useEffect(() => {
        async function fetchOrder() {
            try {
                // If it's an offline stashed order ID, load from local storage
                if (orderId?.startsWith('OFFLINE-')) {
                    const offlineData = getPendingOfflineOrder(orderId);
                    if (offlineData) {
                        setOrder(offlineData as unknown as Order);
                        setLoading(false);
                        return;
                    }
                }

                // Standard Firestore Lookup
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
                } else {
                    // Fallback lookup in offline queue if Firestore document not created yet
                    const offlineFallback = getPendingOfflineOrder(orderId);
                    if (offlineFallback) {
                        setOrder(offlineFallback as unknown as Order);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch online order, checking local queue:', err);
                const offlineFallback = getPendingOfflineOrder(orderId);
                if (offlineFallback) {
                    setOrder(offlineFallback as unknown as Order);
                }
            } finally {
                setLoading(false);
            }
        }

        if (orderId) fetchOrder();
    }, [orderId]);

    // Track conversion once order data is available
    useEffect(() => {
        if (order && !tracked.current) {
            tracked.current = true;
            trackEvent('order_placed', 'conversion', 'order', order.totalAmount);
        }
    }, [order]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="flex-1 flex items-center justify-center min-h-[50vh]">
                    <LoadingSpinner text="Loading order details..." />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="flex-1 max-w-lg mx-auto px-4 py-8 text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-1">Order Placed!</h1>
                <p className="text-xs sm:text-sm text-gray-500 mb-6">
                    We&apos;ll call or WhatsApp you shortly to confirm your order before preparation.
                </p>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 text-left shadow-xs">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold mb-0.5">Order Reference</p>
                            <p className="text-xs font-mono font-bold text-gray-900 break-all">{orderId}</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-full">
                            Pending
                        </span>
                    </div>

                    {order && (
                        <div className="space-y-2.5 text-xs sm:text-sm border-t border-gray-100 pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Name</span>
                                <span className="font-semibold text-gray-900">{order.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mobile</span>
                                <span className="font-semibold text-gray-900">+91 {order.mobile}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Delivery Type</span>
                                <span className="font-semibold text-gray-900 capitalize">{order.deliveryType}</span>
                            </div>
                            {order.deliveryZoneLabel && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Delivery Area</span>
                                    <span className="font-semibold text-gray-900">{order.deliveryZoneLabel}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-100 pt-2.5">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="font-black text-red-600 text-base">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Estimated Delivery Note */}
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 mb-6 text-xs text-blue-800 font-medium">
                    📍 <strong>Delivery:</strong> {SHOP_CONFIG.estimatedDeliveryTime} in Mudukulathur
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <a
                        href={buildWhatsAppUrl(orderId, order?.customerName, order?.totalAmount)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-md shadow-emerald-500/20 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                        Confirm via WhatsApp
                    </a>

                    {order?.mobile && (
                        <Link
                            href={`/track-order?mobile=${order.mobile}`}
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black active:scale-[0.98] transition-all text-sm"
                        >
                            Track Order Status
                        </Link>
                    )}

                    <Link
                        href="/"
                        className="block w-full py-2.5 text-center text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}

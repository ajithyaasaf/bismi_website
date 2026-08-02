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
                        href={buildWhatsAppUrl(orderId, order?.customerName || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-md shadow-emerald-500/20 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
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

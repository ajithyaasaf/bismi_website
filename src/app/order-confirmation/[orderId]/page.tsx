'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { formatCurrency, buildWhatsAppUrl } from '@/lib/utils';
import { SHOP_CONFIG } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderConfirmationPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
                }
            } catch (err) {
                console.error('Failed to fetch order:', err);
            } finally {
                setLoading(false);
            }
        }

        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <LoadingSpinner text="Loading order details..." />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="flex-1 max-w-lg mx-auto px-4 py-10 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-green-600">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
                <p className="text-gray-500 mb-6">
                    We&apos;ll call or WhatsApp you shortly to confirm your order before preparation.
                </p>

                {/* Order ID Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 text-left">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                            <p className="text-sm font-mono font-bold text-gray-900 break-all">{orderId}</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                            Pending
                        </span>
                    </div>

                    {order && (
                        <>
                            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-medium text-gray-900">{order.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mobile</span>
                                    <span className="font-medium text-gray-900">+91 {order.mobile}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Type</span>
                                    <span className="font-medium text-gray-900 capitalize">{order.deliveryType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Estimated Time */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Estimated time:</strong> {SHOP_CONFIG.estimatedDeliveryTime}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <a
                        href={buildWhatsAppUrl(orderId, order?.customerName || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
                        </svg>
                        Confirm via WhatsApp
                    </a>

                    {order?.mobile && (
                        <Link
                            href={`/track-order?mobile=${order.mobile}`}
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black active:scale-[0.98] transition-all shadow-md shadow-gray-200"
                        >
                            Track Order Status
                        </Link>
                    )}

                    <Link
                        href="/"
                        className="block w-full py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}

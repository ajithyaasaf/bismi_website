'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/config';
import { formatCurrency, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Strict status transition rules.
 * Only allowed transitions are defined here.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
    [OrderStatus.ACCEPTED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order || updating) return;

        // Validate transition
        if (!ALLOWED_TRANSITIONS[order.status].includes(newStatus)) {
            alert('Invalid status transition');
            return;
        }

        setUpdating(true);
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: serverTimestamp(),
            });
            setOrder({ ...order, status: newStatus });
            setShowCancelConfirm(false);
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update order status. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <LoadingSpinner text="Loading order..." />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600 mb-4">Order not found</p>
                <Link href="/admin/orders" className="text-sm text-red-600 hover:underline">
                    ← Back to Orders
                </Link>
            </div>
        );
    }

    const statusConf = STATUS_CONFIG[order.status];
    const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status];

    return (
        <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-3xl">
            {/* Back Link */}
            <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
            >
                ← Back to Orders
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Order #{orderId.slice(-6)}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusConf.color}`}>
                    {statusConf.label}
                </span>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Customer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-gray-400">Name</span>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                    </div>
                    <div>
                        <span className="text-gray-400">Mobile</span>
                        <p className="font-medium text-gray-900">
                            <a href={`tel:+91${order.mobile}`} className="text-red-600 hover:underline">
                                +91 {order.mobile}
                            </a>
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-400">Delivery Type</span>
                        <p className="font-medium text-gray-900 capitalize">{order.deliveryType}</p>
                    </div>
                    {order.address && (
                        <div>
                            <span className="text-gray-400">Address</span>
                            <p className="font-medium text-gray-900">{order.address}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Items</h2>
                <div className="space-y-3">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                            <div>
                                <p className="font-medium text-gray-900">{item.meatName}</p>
                                <p className="text-xs text-gray-400">
                                    {item.kg} kg × {formatCurrency(item.pricePerKg)}/kg
                                </p>
                            </div>
                            <span className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Delivery Charge</span>
                        <span className="font-medium">
                            {order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge)}
                        </span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <span className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Status Actions */}
            {allowedNextStatuses.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h2 className="text-sm font-bold text-gray-900 mb-3">Update Status</h2>

                    <div className="flex flex-wrap gap-3">
                        {/* Forward transitions */}
                        {allowedNextStatuses
                            .filter((s) => s !== OrderStatus.CANCELLED)
                            .map((status) => {
                                const conf = STATUS_CONFIG[status];
                                return (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        disabled={updating}
                                        className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${status === OrderStatus.ACCEPTED
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97]'
                                                : 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.97]'
                                            }`}
                                    >
                                        {updating ? '...' : `Mark as ${conf.label}`}
                                    </button>
                                );
                            })}

                        {/* Cancel */}
                        {allowedNextStatuses.includes(OrderStatus.CANCELLED) && !showCancelConfirm && (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>

                    {/* Cancel Confirmation */}
                    {showCancelConfirm && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-700 mb-3">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusChange(OrderStatus.CANCELLED)}
                                    disabled={updating}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {updating ? 'Cancelling...' : 'Yes, Cancel'}
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    No, Keep
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

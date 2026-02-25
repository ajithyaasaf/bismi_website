'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import { DeliveryType, OrderStatus } from '@/types';
import { formatCurrency, validateMobile, generateIdempotencyToken, computeDeliveryCharge } from '@/lib/utils';
import { SHOP_CONFIG, DELIVERY_SLOTS } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.DELIVERY);
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [idempotencyToken, setIdempotencyToken] = useState(() => generateIdempotencyToken());

    // ─── Returning Customer Autofill ─────────────────────
    const [autofillLoading, setAutofillLoading] = useState(false);
    const lastLookedUpMobile = useRef('');

    const lookupReturningCustomer = useCallback(async (mobileNumber: string) => {
        // Only lookup once per valid number
        if (
            !validateMobile(mobileNumber) ||
            mobileNumber === lastLookedUpMobile.current
        ) return;

        lastLookedUpMobile.current = mobileNumber;
        setAutofillLoading(true);

        try {
            const q = query(
                collection(db, 'orders'),
                where('mobile', '==', mobileNumber),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const prevOrder = snapshot.docs[0].data();
                // Only autofill empty fields — never overwrite user input
                setName((curr) => curr.trim() ? curr : prevOrder.customerName || '');
                setAddress((curr) => curr.trim() ? curr : prevOrder.address || '');
            }
        } catch (err) {
            // Fail silently — autofill is a convenience, not critical
            console.warn('Customer lookup failed:', err);
        } finally {
            setAutofillLoading(false);
        }
    }, []);

    const deliveryCharge = deliveryType === DeliveryType.DELIVERY ? computeDeliveryCharge(subtotal) : 0;
    const total = subtotal + deliveryCharge;

    // Redirect if cart is empty — guarded so clearCart() during submit does NOT trigger this
    useEffect(() => {
        if (items.length === 0 && !submitting) {
            router.replace('/cart');
        }
    }, [items.length, submitting, router]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        else if (name.trim().length < 2) newErrors.name = 'Name is too short';

        if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
        else if (!validateMobile(mobile.trim())) newErrors.mobile = 'Enter a valid 10-digit mobile number';

        if (deliveryType === DeliveryType.DELIVERY && !address.trim()) {
            newErrors.address = 'Address is required for delivery';
        }

        if (subtotal < SHOP_CONFIG.minimumOrderAmount) {
            newErrors.subtotal = `Minimum order amount is ${formatCurrency(SHOP_CONFIG.minimumOrderAmount)}`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || submitting) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            // Check for duplicate submission
            const dupQuery = query(
                collection(db, 'orders'),
                where('idempotencyToken', '==', idempotencyToken)
            );
            const dupSnapshot = await getDocs(dupQuery);
            if (!dupSnapshot.empty) {
                // Order already exists — redirect to confirmation
                router.push(`/order-confirmation/${dupSnapshot.docs[0].id}`);
                return;
            }

            // Build order items with locked prices
            const orderItems = items.map((item) => {
                if (item.unit === 'piece') {
                    return {
                        meatTypeId: item.meatTypeId,
                        meatName: item.meatName,
                        unit: item.unit,
                        pieces: item.pieces,
                        pricePerPiece: item.pricePerPiece,
                        cuttingPreference: item.cuttingPreference,
                        subtotal: Number(((item.pieces ?? 0) * (item.pricePerPiece ?? 0)).toFixed(2)),
                    };
                }
                return {
                    meatTypeId: item.meatTypeId,
                    meatName: item.meatName,
                    unit: item.unit,
                    kg: item.kg,
                    pricePerKg: item.pricePerKg,
                    subtotal: Number(((item.kg ?? 0) * (item.pricePerKg ?? 0)).toFixed(2)),
                };
            });

            // Build order document
            const orderData: Record<string, unknown> = {
                customerName: name.trim(),
                mobile: mobile.trim(),
                items: orderItems,
                subtotal: Number(subtotal.toFixed(2)),
                deliveryCharge: Number(deliveryCharge.toFixed(2)),
                totalAmount: Number(total.toFixed(2)),
                deliveryType,
                address: deliveryType === DeliveryType.DELIVERY ? address.trim() : '',
                status: OrderStatus.PENDING,
                idempotencyToken,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Only include delivery slot if delivery + slot selected
            if (deliveryType === DeliveryType.DELIVERY && deliveryTimeSlot) {
                orderData.deliveryTimeSlot = deliveryTimeSlot;
            }

            const orderRef = await addDoc(collection(db, 'orders'), orderData);

            // Rotate the token BEFORE clearing cart to prevent the empty-cart
            // redirect from firing before navigation completes.
            setIdempotencyToken(generateIdempotencyToken());
            clearCart();
            router.replace(`/order-confirmation/${orderRef.id}`);
        } catch (err) {
            console.error('Order submission failed:', err);
            setSubmitError('Something went wrong. Please check your connection and try again.');
            setSubmitting(false);
        }
    };

    // Don't render the form if cart is empty and we are not in the middle of submitting
    if (items.length === 0 && !submitting) return null;

    return (
        <>
            <Header />
            <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Customer Details */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Your Details</h2>

                        <div className="space-y-4">
                            {/* Mobile — placed first for autofill flow */}
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Mobile Number *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">+91</span>
                                    <input
                                        id="mobile"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                        onBlur={() => lookupReturningCustomer(mobile.trim())}
                                        placeholder="9876543210"
                                        className={`w-full pl-12 pr-10 py-3 text-sm border-2 rounded-xl transition-colors ${errors.mobile ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                            }`}
                                    />
                                    {autofillLoading && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <span className="block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                        </span>
                                    )}
                                </div>
                                {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
                            </div>

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl transition-colors ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Type */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Delivery Method</h2>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setDeliveryType(DeliveryType.DELIVERY)}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${deliveryType === DeliveryType.DELIVERY
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🛵</div>
                                <div className="text-sm font-semibold text-gray-900">Delivery</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {deliveryCharge === 0 ? 'FREE' : `${formatCurrency(deliveryCharge)} charge`}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeliveryType(DeliveryType.PICKUP)}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${deliveryType === DeliveryType.PICKUP
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🏪</div>
                                <div className="text-sm font-semibold text-gray-900">Pickup</div>
                                <div className="text-xs text-gray-500 mt-0.5">From our shop</div>
                            </button>
                        </div>

                        {/* Address + Time Slot (only for delivery) */}
                        {deliveryType === DeliveryType.DELIVERY && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Delivery Address *
                                    </label>
                                    <textarea
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="House/Flat, Street, Landmark, Town"
                                        rows={3}
                                        className={`w-full px-4 py-3 text-sm border-2 rounded-xl resize-none transition-colors ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                            }`}
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                </div>

                                {/* Delivery Time Slot */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Delivery Time
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {DELIVERY_SLOTS.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setDeliveryTimeSlot(deliveryTimeSlot === slot ? '' : slot)}
                                                className={`px-4 py-2.5 text-sm text-left rounded-xl border-2 transition-all ${deliveryTimeSlot === slot
                                                    ? 'border-red-500 bg-red-50 font-semibold text-gray-900'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-400">Optional — we&apos;ll confirm the exact time with you</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-2 text-sm mb-4">
                            {items.map((item) => {
                                const isPerPiece = item.unit === 'piece';
                                const qtyLabel = isPerPiece
                                    ? `${item.pieces} pcs`
                                    : `${item.kg}kg`;
                                const lineTotal = isPerPiece
                                    ? (item.pieces ?? 0) * (item.pricePerPiece ?? 0)
                                    : (item.kg ?? 0) * (item.pricePerKg ?? 0);

                                return (
                                    <div key={item.meatTypeId} className="flex justify-between text-gray-600">
                                        <span className="truncate mr-2">
                                            {item.meatName} × {qtyLabel}
                                        </span>
                                        <span className="shrink-0 font-medium">
                                            {formatCurrency(lineTotal)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="font-medium">
                                    {deliveryType === DeliveryType.PICKUP
                                        ? '—'
                                        : deliveryCharge === 0
                                            ? 'FREE'
                                            : formatCurrency(deliveryCharge)}
                                </span>
                            </div>
                            <div className="border-t border-gray-100 pt-2 flex justify-between">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-lg text-gray-900">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                        <span className="text-xl">💰</span>
                        <div>
                            <p className="text-sm font-semibold text-yellow-800">Cash on Delivery</p>
                            <p className="text-xs text-yellow-700">
                                Pay {formatCurrency(total)} when you receive your order.
                            </p>
                        </div>
                    </div>

                    {/* Confirmation Microcopy */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <span className="text-lg">📞</span>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            We will call or WhatsApp you shortly to confirm your preferred delivery time.
                        </p>
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
                            <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-4 font-bold text-white rounded-xl transition-all ${submitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-200'
                            }`}
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Placing Order...
                            </span>
                        ) : (
                            `Place Order — ${formatCurrency(total)}`
                        )}
                    </button>
                </form>
            </main>
            <Footer />
        </>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import ImageWithSkeleton from '@/components/ImageWithSkeleton';
import { DeliveryType, OrderStatus } from '@/types';
import { formatCurrency, validateMobile, generateIdempotencyToken, computeDeliveryCharge } from '@/lib/utils';
import { SHOP_CONFIG, DELIVERY_ZONES } from '@/lib/config';
import { savePendingOfflineOrder } from '@/lib/offlineQueue';
import {
    getAvailableSlots,
    getTodayDateString,
    type AvailableSlot,
    type SlotAvailabilityResult,
} from '@/lib/slotControl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trackEvent } from '@/lib/analytics';

export type PaymentMethod = 'COD' | 'UPI';

const SAVED_CUSTOMER_KEY = 'bismi_saved_customer';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, isHydrated, clearCart } = useCart();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.DELIVERY);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [deliveryZone, setDeliveryZone] = useState('');
    const [isZoneOpen, setIsZoneOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [isAutofilled, setIsAutofilled] = useState(false);
    const [idempotencyToken, setIdempotencyToken] = useState(() => generateIdempotencyToken());

    // ─── Slot Availability State ──────────────────────────
    const [slotResult, setSlotResult] = useState<SlotAvailabilityResult | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(true);

    const deliveryCharge = deliveryType === DeliveryType.DELIVERY ? computeDeliveryCharge(subtotal) : 0;
    const total = subtotal + deliveryCharge;

    // UPI Intent Deep Link URL
    const upiIntentUrl = `upi://pay?pa=${SHOP_CONFIG.upiId}&pn=${encodeURIComponent(SHOP_CONFIG.name)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Meat Order Payment')}`;

    const CHECKOUT_FORM_KEY = 'bismi_checkout_draft';

    // ─── Load Saved / Draft Customer Details on Mount ───────
    useEffect(() => {
        try {
            const savedRaw = localStorage.getItem(CHECKOUT_FORM_KEY) || localStorage.getItem(SAVED_CUSTOMER_KEY);
            if (savedRaw) {
                const saved = JSON.parse(savedRaw);
                if (saved.name) setName(saved.name);
                if (saved.mobile) setMobile(saved.mobile);
                if (saved.deliveryZone) {
                    const matchedZone = DELIVERY_ZONES.find((z) => z.key === saved.deliveryZone || z.label === saved.deliveryZone);
                    setDeliveryZone(matchedZone ? matchedZone.label : saved.deliveryZone);
                }
                if (saved.address) setAddress(saved.address);
                setIsAutofilled(true);
            }
        } catch (err) {
            console.warn('Failed to load draft customer details:', err);
        }
    }, []);

    // ─── Auto-save Form Draft on Any Field Change ───────────
    useEffect(() => {
        try {
            localStorage.setItem(
                CHECKOUT_FORM_KEY,
                JSON.stringify({ name, mobile, deliveryZone, address })
            );
        } catch (err) {
            console.warn('Failed to save checkout draft:', err);
        }
    }, [name, mobile, deliveryZone, address]);

    // ─── Fetch Available Slots ────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function loadSlots() {
            setSlotsLoading(true);
            try {
                const today = getTodayDateString();
                const result = await getAvailableSlots(today);
                if (!cancelled) {
                    setSlotResult(result);
                }
            } catch (err) {
                console.error('Failed to load delivery slots:', err);
            } finally {
                if (!cancelled) setSlotsLoading(false);
            }
        }

        loadSlots();
        return () => { cancelled = true; };
    }, []);

    // ─── Track checkout start ────────────────────────────
    useEffect(() => {
        trackEvent('checkout_start', 'checkout');
    }, []);

    // Redirect if cart is empty after hydration — guarded so clearCart() during submit does NOT trigger this
    useEffect(() => {
        if (isHydrated && items.length === 0 && !submitting) {
            router.replace('/cart');
        }
    }, [isHydrated, items.length, submitting, router]);

    const handleCopyUpi = () => {
        navigator.clipboard.writeText(SHOP_CONFIG.upiId);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 3000);
    };

    const handleClearSavedAddress = () => {
        setName('');
        setMobile('');
        setDeliveryZone('');
        setAddress('');
        setIsAutofilled(false);
        try {
            localStorage.removeItem(SAVED_CUSTOMER_KEY);
        } catch (err) {
            console.warn('Failed to remove saved customer key:', err);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        else if (name.trim().length < 2) newErrors.name = 'Name is too short';

        if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
        else if (!validateMobile(mobile.trim())) newErrors.mobile = 'Enter a valid 10-digit mobile number';

        if (deliveryType === DeliveryType.DELIVERY) {
            if (!deliveryZone) {
                newErrors.deliveryZone = 'Please select your delivery area or village';
            }
            if (!address.trim()) {
                newErrors.address = 'House number, street & nearby landmark details are required';
            }
        }

        if (subtotal < SHOP_CONFIG.minimumOrderAmount) {
            newErrors.subtotal = `Minimum order amount is ${formatCurrency(SHOP_CONFIG.minimumOrderAmount)}`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveCustomerInfoLocally = () => {
        try {
            const info = {
                name: name.trim(),
                mobile: mobile.trim(),
                deliveryZone,
                address: address.trim(),
            };
            localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(info));
        } catch (err) {
            console.warn('Failed to save customer details locally:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || submitting) return;

        setSubmitting(true);
        setSubmitError('');

        // Persist customer address for future 1-click checkout
        saveCustomerInfoLocally();

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

        // Build order payload
        const orderData: Record<string, unknown> = {
            customerName: name.trim(),
            mobile: mobile.trim(),
            items: orderItems,
            subtotal: Number(subtotal.toFixed(2)),
            deliveryCharge: Number(deliveryCharge.toFixed(2)),
            totalAmount: Number(total.toFixed(2)),
            deliveryType,
            paymentMethod,
            address: deliveryType === DeliveryType.DELIVERY ? address.trim() : '',
            deliveryZone: deliveryType === DeliveryType.DELIVERY ? deliveryZone : '',
            deliveryZoneLabel: deliveryType === DeliveryType.DELIVERY
                ? (DELIVERY_ZONES.find(z => z.key === deliveryZone)?.label ?? '')
                : '',
            status: OrderStatus.PENDING,
            idempotencyToken,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (deliveryType === DeliveryType.DELIVERY && selectedSlot) {
            orderData.deliveryTimeSlot = selectedSlot.label;
            orderData.deliverySlot = selectedSlot.key;
            orderData.deliveryDate = slotResult?.date ?? getTodayDateString();
        }

        try {
            if (navigator.onLine) {
                const orderRef = await addDoc(collection(db, 'orders'), orderData);
                setIdempotencyToken(generateIdempotencyToken());
                clearCart();
                router.replace(`/order-confirmation/${orderRef.id}`);
                return;
            }
            
            // Offline queue fallback
            const offlineId = savePendingOfflineOrder(orderData);
            setIdempotencyToken(generateIdempotencyToken());
            clearCart();
            router.replace(`/order-confirmation/${offlineId}`);
        } catch (err) {
            console.warn('Network write dropped, stashing offline queue:', err);
            const offlineId = savePendingOfflineOrder(orderData);
            setIdempotencyToken(generateIdempotencyToken());
            clearCart();
            router.replace(`/order-confirmation/${offlineId}`);
        }
    };

    if (items.length === 0 && !submitting) return null;

    const availableSlots = slotResult?.slots ?? [];
    const isShowingTomorrow = slotResult ? !slotResult.isToday : false;
    const slotDateLabel = isShowingTomorrow ? 'Tomorrow' : 'Today';

    return (
        <>
            <Header />
            <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

                <form onSubmit={handleSubmit} noValidate>
                    
                    {/* Customer Contact Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-gray-900">Your Contact Details</h2>
                        </div>

                        {/* Saved Address Badge */}
                        {isAutofilled && (
                            <div className="mb-4 px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <span className="text-sm">✨</span>
                                    Auto-filled from your previous order
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClearSavedAddress}
                                    className="text-emerald-700 hover:text-emerald-900 underline text-[11px] font-semibold"
                                >
                                    Clear Form
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Mobile Number */}
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    WhatsApp / Mobile Number *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">+91</span>
                                    <input
                                        id="mobile"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                        placeholder="9876543210"
                                        className={`w-full pl-12 pr-4 py-3 text-sm border-2 rounded-xl transition-colors ${errors.mobile ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                            }`}
                                    />
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

                    {/* Delivery Option */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-xs">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Delivery Option</h2>

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
                                <div className="text-sm font-semibold text-gray-900">Home Delivery</div>
                                <div className="text-xs text-emerald-600 font-bold mt-0.5">
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
                                <div className="text-sm font-semibold text-gray-900">Shop Pickup</div>
                                <div className="text-xs text-gray-500 mt-0.5">Mudukulathur</div>
                            </button>
                        </div>

                        {/* Ultra-Clean Rural Address Form */}
                        {deliveryType === DeliveryType.DELIVERY && (
                            <div className="space-y-4 pt-1">
                                {/* Village / Area Field with Suggestions */}
                                <div>
                                    <label htmlFor="deliveryZone" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                        Village / Delivery Area *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="deliveryZone"
                                            type="text"
                                            value={deliveryZone}
                                            onFocus={() => setIsZoneOpen(true)}
                                            onBlur={() => setTimeout(() => setIsZoneOpen(false), 200)}
                                            onChange={(e) => {
                                                setDeliveryZone(e.target.value);
                                                setIsZoneOpen(true);
                                            }}
                                            placeholder="Type or select your village / area..."
                                            className={`w-full pl-4 pr-10 py-3 text-sm border-2 rounded-xl transition-all outline-none ${
                                                errors.deliveryZone
                                                    ? 'border-red-400 bg-red-50'
                                                    : 'border-gray-200 focus:border-red-500 focus:bg-white'
                                            }`}
                                        />
                                        {deliveryZone && (
                                            <button
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setDeliveryZone('');
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                                            >
                                                ✕
                                            </button>
                                        )}

                                        {/* Floating White Dropdown - Compact, Max 3-4 items visible, scrollable */}
                                        {isZoneOpen && (
                                            <div
                                                style={{ maxHeight: '160px', overflowY: 'auto' }}
                                                className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl divide-y divide-gray-100"
                                            >
                                                {(() => {
                                                    const exactMatch = DELIVERY_ZONES.some((z) => z.label === deliveryZone);
                                                    const visibleZones = exactMatch || !deliveryZone.trim()
                                                        ? DELIVERY_ZONES
                                                        : DELIVERY_ZONES.filter((z) =>
                                                            z.label.toLowerCase().includes(deliveryZone.toLowerCase())
                                                        );

                                                    return visibleZones.length > 0 ? (
                                                        visibleZones.map((zone) => {
                                                            const isSelected = deliveryZone === zone.label;
                                                            return (
                                                                <button
                                                                    key={zone.key}
                                                                    type="button"
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        setDeliveryZone(zone.label);
                                                                        setIsZoneOpen(false);
                                                                    }}
                                                                    className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between ${
                                                                        isSelected
                                                                            ? 'bg-red-50 text-red-600 font-semibold'
                                                                            : 'text-gray-800 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    <span className="truncate">📍 {zone.label}</span>
                                                                    {isSelected && (
                                                                        <span className="text-red-500 font-bold ml-2">✓</span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="px-3 py-2 text-xs text-gray-500 italic">
                                                            Using typed area: "{deliveryZone}"
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        💡 Tap input to choose area or type your village name directly.
                                    </p>
                                    {errors.deliveryZone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.deliveryZone}</p>}
                                </div>

                                {/* Detailed Address & Landmark Field */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                        Street Name & Famous Landmark *
                                    </label>
                                    <textarea
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. Door No. 12/4, Opposite Perumal Kovil, Yellow house"
                                        rows={3}
                                        className={`w-full px-4 py-3 text-sm border-2 rounded-xl resize-none transition-all outline-none ${
                                            errors.address
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-200 focus:border-red-500 focus:bg-white'
                                        }`}
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-red-500 font-medium">{errors.address}</p>}
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        💡 Mention street, village, and a nearby landmark (Kovil, Bus Stop, School) so our delivery boy easily reaches your house.
                                    </p>
                                </div>

                                {/* Preferred Delivery Time Slot */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Delivery Time Slot
                                        {isShowingTomorrow && (
                                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full uppercase">
                                                {slotDateLabel}
                                            </span>
                                        )}
                                    </label>

                                    {slotsLoading ? (
                                        <div className="flex items-center gap-2 py-3">
                                            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                            <span className="text-xs text-gray-500">Checking delivery slots…</span>
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                            <p className="text-xs text-amber-700">
                                                Fastest available delivery slot will be assigned.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {availableSlots.map((slot) => (
                                                <button
                                                    key={slot.key}
                                                    type="button"
                                                    onClick={() => setSelectedSlot(
                                                        selectedSlot?.key === slot.key ? null : slot
                                                    )}
                                                    className={`px-4 py-2.5 text-xs text-left rounded-xl border-2 transition-all ${selectedSlot?.key === slot.key
                                                        ? 'border-red-500 bg-red-50 font-semibold text-gray-900'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {slot.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method Option */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-xs">
                        <h2 className="text-sm font-bold text-gray-900 mb-3">Select Payment Method</h2>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('COD')}
                                className={`p-3.5 rounded-xl border-2 text-left transition-all ${paymentMethod === 'COD'
                                    ? 'border-red-500 bg-red-50/80'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">💵</span>
                                    <span className="text-xs font-bold text-gray-900">Cash on Delivery</span>
                                </div>
                                <p className="text-[11px] text-gray-500">Pay cash upon delivery</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('UPI')}
                                className={`p-3.5 rounded-xl border-2 text-left transition-all ${paymentMethod === 'UPI'
                                    ? 'border-red-500 bg-red-50/80'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">📲</span>
                                    <span className="text-xs font-bold text-gray-900">Pay via UPI</span>
                                </div>
                                <p className="text-[11px] text-emerald-600 font-semibold">GPay / PhonePe / Paytm</p>
                            </button>
                        </div>

                        {paymentMethod === 'UPI' && (
                            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-900">Shop UPI ID:</span>
                                    <code className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md text-emerald-700 border border-emerald-200">
                                        {SHOP_CONFIG.upiId}
                                    </code>
                                </div>

                                <a
                                    href={upiIntentUrl}
                                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                                >
                                    <span>⚡ Open UPI App & Pay {formatCurrency(total)}</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={handleCopyUpi}
                                    className="w-full text-center text-[11px] text-emerald-700 hover:underline font-semibold"
                                >
                                    {copiedUpi ? '✓ UPI ID Copied!' : 'Copy UPI ID to clipboard'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-xs">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3.5 text-sm mb-4">
                            {items.map((item) => {
                                const isPerPiece = item.unit === 'piece';
                                const qtyLabel = isPerPiece ? `${item.pieces} pcs` : `${item.kg}kg`;
                                const lineTotal = isPerPiece
                                    ? (item.pieces ?? 0) * (item.pricePerPiece ?? 0)
                                    : (item.kg ?? 0) * (item.pricePerKg ?? 0);

                                return (
                                    <div key={item.meatTypeId} className="flex items-center gap-3">
                                        {item.imageURL && (
                                            <ImageWithSkeleton
                                                src={item.imageURL}
                                                alt={item.meatName}
                                                fill
                                                sizes="48px"
                                                containerClassName="w-12 h-12 shrink-0 rounded-lg border border-gray-200"
                                                imageClassName="object-cover"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 font-medium truncate">{item.meatName}</p>
                                            <p className="text-xs text-gray-500">Qty: <span className="font-semibold">{qtyLabel}</span></p>
                                        </div>
                                        <div className="shrink-0 font-bold text-gray-900">{formatCurrency(lineTotal)}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="font-medium text-emerald-600 font-bold">
                                    {deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                <span className="font-black text-gray-900 uppercase tracking-wider text-xs">Total</span>
                                <span className="font-black text-xl text-red-600">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-4 font-bold text-white text-base rounded-2xl transition-all ${submitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-500/20'
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

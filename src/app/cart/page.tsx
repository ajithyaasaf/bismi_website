'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { SHOP_CONFIG } from '@/lib/config';

export default function CartPage() {
    const { items, subtotal, updateQuantity, removeItem } = useCart();

    const deliveryCharge = 0; // Always free
    const total = subtotal + deliveryCharge;
    const isBelowMinimum = subtotal < SHOP_CONFIG.minimumOrderAmount;

    if (items.length === 0) {
        return (
            <>
                <Header />
                <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-gray-500 mb-8">Add some fresh meat from our menu to get started.</p>
                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                    >
                        Browse Menu
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                    {items.map((item) => {
                        const isPerPiece = item.unit === 'piece';
                        const qtyDisplay = isPerPiece
                            ? `${item.pieces} piece${(item.pieces ?? 0) > 1 ? 's' : ''}`
                            : `${item.kg} kg`;
                        const priceDisplay = isPerPiece
                            ? `${formatCurrency(item.pricePerPiece ?? 0)} / piece`
                            : `${formatCurrency(item.pricePerKg ?? 0)} / kg`;
                        const itemTotal = isPerPiece
                            ? (item.pieces ?? 0) * (item.pricePerPiece ?? 0)
                            : (item.kg ?? 0) * (item.pricePerKg ?? 0);

                        return (
                            <div
                                key={item.meatTypeId}
                                className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3"
                            >
                                {/* Item Image */}
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                    <Image
                                        src={item.imageURL}
                                        alt={item.meatName}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>

                                {/* Item Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.meatName}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{priceDisplay}</p>

                                    {/* Cutting preference badge for quail */}
                                    {item.cuttingPreference && (
                                        <span className="inline-block mt-1 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                                            {item.cuttingPreference}
                                        </span>
                                    )}

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => {
                                                const currentQty = isPerPiece ? (item.pieces ?? 1) : (item.kg ?? 0.5);
                                                const step = isPerPiece ? 1 : 0.5;
                                                const minQty = isPerPiece ? 1 : 0.5;
                                                const newQty = Math.max(minQty, currentQty - step);
                                                updateQuantity(item.meatTypeId, newQty);
                                            }}
                                            className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors text-sm font-bold"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm font-semibold text-gray-900 min-w-[60px] text-center">
                                            {qtyDisplay}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const currentQty = isPerPiece ? (item.pieces ?? 1) : (item.kg ?? 0.5);
                                                const step = isPerPiece ? 1 : 0.5;
                                                updateQuantity(item.meatTypeId, currentQty + step);
                                            }}
                                            className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors text-sm font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Price & Remove */}
                                <div className="text-right flex flex-col justify-between">
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatCurrency(itemTotal)}
                                    </span>
                                    <button
                                        onClick={() => removeItem(item.meatTypeId)}
                                        className="text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h2>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({items.length} items)</span>
                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery</span>
                            <span className="font-medium text-green-600">FREE 🎉</span>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex justify-between">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-lg text-gray-900">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Minimum Order Warning */}
                {isBelowMinimum && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-center">
                        <p className="text-sm text-yellow-800">
                            Minimum order amount is <strong>{formatCurrency(SHOP_CONFIG.minimumOrderAmount)}</strong>.
                            Add {formatCurrency(SHOP_CONFIG.minimumOrderAmount - subtotal)} more.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href={isBelowMinimum ? '#' : '/checkout'}
                        onClick={(e) => { if (isBelowMinimum) e.preventDefault(); }}
                        className={`block w-full text-center py-3.5 font-bold rounded-xl transition-all ${isBelowMinimum
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-200'
                            }`}
                    >
                        Proceed to Checkout
                    </Link>
                    <Link
                        href="/menu"
                        className="block w-full text-center py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Continue Shopping
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}

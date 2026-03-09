'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { SHOP_CONFIG } from '@/lib/config';

export default function FloatingCartBar() {
    const { items, itemCount, subtotal } = useCart();
    const pathname = usePathname();

    // Hide if cart is empty or we are already on the cart/checkout pages
    const isHiddenPath = pathname === '/cart' || pathname === '/checkout';
    const deliveryCharge = 0; // Always free for now
    const total = subtotal + deliveryCharge;
    const isBelowMinimum = subtotal < SHOP_CONFIG.minimumOrderAmount;

    if (itemCount === 0 || isHiddenPath) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] animate-slide-up pb-safe">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                {/* Cart Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-gray-900 border-r border-gray-300 pr-2">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-sm font-bold text-red-600 truncate">
                            {formatCurrency(total)}
                        </span>
                    </div>
                    {isBelowMinimum ? (
                        <p className="text-[10px] sm:text-xs text-yellow-600 leading-tight">
                            Min. order {formatCurrency(SHOP_CONFIG.minimumOrderAmount)}
                        </p>
                    ) : (
                        <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">
                            Plus zero delivery charge
                        </p>
                    )}
                </div>

                {/* Checkout CTA */}
                <Link
                    href={isBelowMinimum ? '/cart' : '/checkout'}
                    className={`shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${isBelowMinimum
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95'
                        }`}
                >
                    {isBelowMinimum ? 'View Cart' : 'Buy Now →'}
                </Link>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MeatType } from '@/types';
import { formatCurrency } from '@/lib/utils';

// ─── Conversion Content Map ────────────────────────────────────────────────
// Defines what each product is "Best For" and its approximate serving size.
// This is purely UI/marketing copy — no database changes needed.
const PRODUCT_METADATA: Record<string, { bestFor: string[]; serves: string; freshTag: string }> = {
    'Chicken Curry Cut': { bestFor: ['Curry', 'Gravy', 'Masala'], serves: '3–4 people / kg', freshTag: 'Most Ordered' },
    'Chicken Small Curry Cut': { bestFor: ['Curry', 'Quick Cook', 'Kids'], serves: '3–4 people / kg', freshTag: 'Fast Cooking' },
    'Chicken Gravy Cut': { bestFor: ['Gravy', 'Stew', 'Soup'], serves: '3–4 people / kg', freshTag: 'Rich Flavour' },
    'Chicken Biriyani Cut': { bestFor: ['Biryani', 'Dum Rice', 'Pulav'], serves: '3–4 people / kg', freshTag: 'Best Seller' },
    'Chicken Boneless': { bestFor: ['Fry', 'Kabab', 'Stir Fry'], serves: '4–5 people / kg', freshTag: 'No Bones' },
    'Chicken Breast': { bestFor: ['Fry', 'Grill', 'Health Meals'], serves: '2–3 people / kg', freshTag: 'High Protein' },
    'Chicken Leg': { bestFor: ['BBQ', 'Grill', 'Roast'], serves: '2–3 pieces / kg', freshTag: 'Family Fav' },
    'Chicken Wings': { bestFor: ['BBQ', 'Fry', 'Party Snack'], serves: '5–6 wings / kg', freshTag: 'Party Pick' },
    'Chicken Lollipop': { bestFor: ['Party Starter', 'Fry', 'BBQ'], serves: '5–6 pieces / kg', freshTag: 'Party Pick' },
    'Chicken Keema': { bestFor: ['Kottu', 'Paratha', 'Rolls'], serves: '4–5 people / kg', freshTag: 'Versatile' },
    'Country Chicken (Naatu Kozhi)': { bestFor: ['Naatu Kozhi Curry', 'Soup', 'Country Gravy'], serves: '4–5 people / kg', freshTag: 'Farm Fresh' },
    'White Egg': { bestFor: ['Breakfast', 'Omelette', 'Baking'], serves: '1 egg per person', freshTag: 'Farm Fresh' },
    'Kaadai Egg': { bestFor: ['Boiled', 'Curry', 'Snack'], serves: '2–3 eggs per person', freshTag: 'Rich Protein' },
};

const DEFAULT_METADATA = { bestFor: ['Curry', 'Gravy', 'Fry'], serves: '3–4 people / kg', freshTag: 'Fresh Today' };

// ─── Trust Badges ────────────────────────────────────────────────────────────
const TRUST_BADGES = [
    { icon: '✅', label: 'Fresh Daily' },
    { icon: '🔪', label: 'Cleaned & Cut' },
    { icon: '🚫', label: 'No Preservatives' },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface ProductSheetProps {
    product: MeatType;
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
    onBuyNow?: () => void;
}

export default function ProductSheet({ product, isOpen, onClose, onAdd, onBuyNow }: ProductSheetProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);

    const isPerPiece = product.unit === 'piece';
    const isAvailableToday = product.isAvailableToday !== false;
    const meta = PRODUCT_METADATA[product.name] ?? DEFAULT_METADATA;

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimating(true)));
            // scrollbar-gutter: stable in globals.css permanently reserves the scrollbar
            // space — no paddingRight compensation needed. Just lock overflow.
            document.body.style.overflow = 'hidden';
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => () => {
        document.body.style.overflow = '';
    }, []);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet Panel */}
            <div
                className={`relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] transition-transform duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label={product.name}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-4 z-20 p-1.5 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">

                    {/* Product Image with fresh tag overlay */}
                    <div className={`relative w-full aspect-[16/9] bg-gray-100 overflow-hidden ${isImageLoading ? 'animate-pulse' : ''}`}>
                        <Image
                            src={product.imageURL}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 448px"
                            className={`object-cover transition-opacity duration-500 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            priority
                            onLoad={() => setIsImageLoading(false)}
                        />
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Overlay Badges */}
                        {isAvailableToday ? (
                            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                                🌿 {meta.freshTag}
                            </span>
                        ) : (
                            <span className="absolute top-3 left-3 bg-gray-900 border border-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                                🛑 Not Available Today
                            </span>
                        )}

                        {/* Price floating on image bottom */}
                        <div className="absolute bottom-3 left-4 text-white">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold drop-shadow">
                                    {formatCurrency(isPerPiece ? (product.pricePerPiece ?? 0) : product.pricePerKg)}
                                </span>
                                <span className="text-sm font-medium opacity-90">
                                    /{isPerPiece ? 'piece' : 'kg'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 space-y-4">

                        {/* Name */}
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                                {product.name}
                            </h2>
                            {product.localName && (
                                <p className="text-sm font-semibold text-red-500/80 mt-0.5" lang="ta">{product.localName}</p>
                            )}
                        </div>

                        {/* Best For Recipe Tags */}
                        <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Best For</p>
                            <div className="flex flex-wrap gap-2">
                                {meta.bestFor.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold rounded-full"
                                    >
                                        🍳 {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Trust Badges Row */}
                        <div className="grid grid-cols-3 gap-2">
                            {TRUST_BADGES.map((badge) => (
                                <div key={badge.label} className="flex flex-col items-center gap-1 bg-green-50 border border-green-100 rounded-xl py-2.5 px-1 text-center">
                                    <span className="text-lg">{badge.icon}</span>
                                    <span className="text-[10px] font-semibold text-green-800 leading-tight">{badge.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="pt-1 border-t border-gray-100">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">About This Cut</p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Bottom Action */}
                <div className="shrink-0 px-4 py-4 border-t border-gray-100 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                    {isAvailableToday ? (
                        <div className={`${onBuyNow ? 'grid grid-cols-2 gap-2' : ''}`}>
                            <button
                                onClick={onAdd}
                                className="w-full py-3.5 text-base font-extrabold rounded-2xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-red-500/20 text-red-600 bg-white border-2 border-red-600 hover:bg-red-50 active:bg-red-100"
                            >
                                Add to Cart 🛒
                            </button>
                            {onBuyNow && (
                                <button
                                    onClick={onBuyNow}
                                    className="w-full py-3.5 text-base font-extrabold rounded-2xl shadow-lg shadow-red-500/30 transition-all focus:outline-none focus:ring-4 focus:ring-red-500/20 text-white bg-red-600 hover:bg-red-700 active:bg-red-800"
                                >
                                    Buy Now
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            disabled
                            className="w-full py-3.5 text-base font-extrabold rounded-2xl text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
                        >
                            Currently Unavailable
                        </button>
                    )}
                    <p className="text-center text-[11px] text-gray-400 mt-2">
                        {isAvailableToday ? 'Delivered fresh to your door · Free delivery' : 'Check back later for fresh stock'}
                    </p>
                </div>
            </div>
        </div>
    );
}

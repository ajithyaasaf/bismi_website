'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MeatType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import QuantitySelector from './QuantitySelector';
import PieceSelectorModal from './PieceSelectorModal';
import ProductSheet from './ProductSheet';

interface ProductCardProps {
    product: MeatType;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [showSelector, setShowSelector] = useState(false);
    const [showSheet, setShowSheet] = useState(false);
    const [addedAnimation, setAddedAnimation] = useState(false);
    const { addItem } = useCart();

    const isPerPiece = product.unit === 'piece';
    const isAvailableToday = product.isAvailableToday !== false; // Treats undefined as true

    const flashAdded = () => {
        setAddedAnimation(true);
        setTimeout(() => setAddedAnimation(false), 1500);
    };

    // Handler for kg-based products
    const handleAddKg = (kg: number) => {
        addItem({
            meatTypeId: product.id,
            meatName: product.name,
            unit: 'kg',
            kg,
            pricePerKg: product.pricePerKg,
            imageURL: product.imageURL,
        });
        setShowSelector(false);
        setShowSheet(false);
        flashAdded();
    };

    // Handler for piece-based products
    const handleAddPieces = (pieces: number, cuttingPreference: string) => {
        addItem({
            meatTypeId: product.id,
            meatName: product.name,
            unit: 'piece',
            pieces,
            pricePerPiece: product.pricePerPiece,
            cuttingPreference,
            imageURL: product.imageURL,
        });
        setShowSelector(false);
        setShowSheet(false);
        flashAdded();
    };

    return (
        <>
            <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow flex flex-col h-full ${isAvailableToday
                ? 'border-gray-100 hover:shadow-md group'
                : 'border-gray-200 opacity-75 grayscale-[0.2]'
                }`}>
                {/* Clickable Area for Product Info (Sheet) */}
                <div
                    className={`${isAvailableToday ? 'cursor-pointer' : 'cursor-default'} flex-1 flex flex-col`}
                    onClick={() => isAvailableToday && setShowSheet(true)}
                    role="button"
                    tabIndex={isAvailableToday ? 0 : -1}
                    aria-label={`View details for ${product.name}`}
                >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden shrink-0">
                        <Image
                            src={product.imageURL}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {addedAnimation && (
                            <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center animate-fade-in z-10">
                                <div className="text-white text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mx-auto mb-1">
                                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-semibold">Added!</span>
                                </div>
                            </div>
                        )}

                        {/* "Per piece" badge for kaadai/eggs */}
                        {isPerPiece && !(!isAvailableToday) && (
                            <span className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm">
                                Per Piece
                            </span>
                        )}

                        {/* Out of Stock Overlay */}
                        {!isAvailableToday && (
                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-gray-700">
                                    Not Available Today
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                        <h3 className="text-[13px] sm:text-base font-bold text-gray-900 mb-0.5 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">{product.name}</h3>
                        {product.localName && (
                            <p className="text-[10px] sm:text-xs font-medium text-red-500/80 mb-1 leading-tight" lang="ta">{product.localName}</p>
                        )}
                        <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 flex-1 leading-snug">{product.description}</p>
                        <div className="mt-auto"></div>
                    </div>
                </div>

                {/* Bottom action area — price stacked above full-width Add button */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0 flex flex-col gap-2">
                    {/* Price row */}
                    <div>
                        {isPerPiece ? (
                            <div className="flex items-baseline gap-1">
                                <span className="text-base sm:text-lg font-extrabold text-red-600 leading-none">
                                    {formatCurrency(product.pricePerPiece ?? 0)}
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium text-gray-400">/pc</span>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-base sm:text-lg font-extrabold text-red-600 leading-none">
                                    {formatCurrency(product.pricePerKg)}
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium text-gray-400">/kg</span>
                            </div>
                        )}
                    </div>

                    {/* Full-width Add button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailableToday) setShowSelector(true);
                        }}
                        disabled={!isAvailableToday}
                        className={`w-full py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all ${isAvailableToday
                            ? 'text-white bg-red-600 hover:bg-red-700 active:bg-red-800'
                            : 'text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200'
                            }`}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        {isAvailableToday ? 'Add to Cart' : 'Unavailable'}
                    </button>
                </div>
            </div>

            {/* Modals */}
            <ProductSheet
                product={product}
                isOpen={showSheet}
                onClose={() => setShowSheet(false)}
                onAdd={() => {
                    setShowSheet(false);
                    // Add slight delay to allow sheet to close before opening selector
                    setTimeout(() => setShowSelector(true), 300);
                }}
            />

            {showSelector && (
                isPerPiece ? (
                    <PieceSelectorModal
                        productName={product.name}
                        pricePerPiece={product.pricePerPiece ?? 0}
                        onSelect={handleAddPieces}
                        onCancel={() => setShowSelector(false)}
                    />
                ) : (
                    <QuantitySelector
                        productName={product.name}
                        onSelect={handleAddKg}
                        onCancel={() => setShowSelector(false)}
                    />
                )
            )}
        </>
    );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MeatType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import QuantitySelector from './QuantitySelector';
import PieceSelectorModal from './PieceSelectorModal';

interface ProductCardProps {
    product: MeatType;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [showSelector, setShowSelector] = useState(false);
    const [addedAnimation, setAddedAnimation] = useState(false);
    const { addItem } = useCart();

    const isPerPiece = product.unit === 'piece';

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
        flashAdded();
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <Image
                        src={product.imageURL}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {addedAnimation && (
                        <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center animate-fade-in">
                            <div className="text-white text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mx-auto mb-1">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold">Added!</span>
                            </div>
                        </div>
                    )}

                    {/* "Per piece" badge for quail */}
                    {isPerPiece && (
                        <span className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Per Piece
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                        <div>
                            {isPerPiece ? (
                                <>
                                    <span className="text-lg font-bold text-red-600">
                                        {formatCurrency(product.pricePerPiece ?? 0)}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-1">/piece</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg font-bold text-red-600">
                                        {formatCurrency(product.pricePerKg)}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-1">/kg</span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSelector(true)}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-all"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Show the right selector modal based on unit type */}
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

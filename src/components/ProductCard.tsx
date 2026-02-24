'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MeatType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import QuantitySelector from './QuantitySelector';

interface ProductCardProps {
    product: MeatType;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [showQtySelector, setShowQtySelector] = useState(false);
    const [addedAnimation, setAddedAnimation] = useState(false);
    const { addItem } = useCart();

    const handleAddToCart = (kg: number) => {
        addItem({
            meatTypeId: product.id,
            meatName: product.name,
            kg,
            pricePerKg: product.pricePerKg, // Lock price at add time
            imageURL: product.imageURL,
        });
        setShowQtySelector(false);

        // Flash "Added" animation
        setAddedAnimation(true);
        setTimeout(() => setAddedAnimation(false), 1500);
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
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-lg font-bold text-red-600">{formatCurrency(product.pricePerKg)}</span>
                            <span className="text-xs text-gray-400 ml-1">/kg</span>
                        </div>
                        <button
                            onClick={() => setShowQtySelector(true)}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-all"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Quantity Selector Modal */}
            {showQtySelector && (
                <QuantitySelector
                    productName={product.name}
                    onSelect={handleAddToCart}
                    onCancel={() => setShowQtySelector(false)}
                />
            )}
        </>
    );
}

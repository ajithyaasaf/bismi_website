'use client';

import { useState } from 'react';
import { validateQuantity } from '@/lib/utils';

interface QuantitySelectorProps {
    onSelect: (kg: number) => void;
    onCancel: () => void;
    productName: string;
}

const PRESET_QUANTITIES = [0.5, 1, 1.5, 2];

export default function QuantitySelector({ onSelect, onCancel, productName }: QuantitySelectorProps) {
    const [customQty, setCustomQty] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [error, setError] = useState('');

    const handlePreset = (kg: number) => {
        onSelect(kg);
    };

    const handleCustomSubmit = () => {
        const qty = parseFloat(customQty);
        if (isNaN(qty) || !validateQuantity(qty)) {
            setError('Min 0.5 kg, max 50 kg');
            return;
        }
        setError('');
        onSelect(qty);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="px-5 pt-5 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">Select Quantity</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{productName}</p>
                </div>

                {/* Presets */}
                <div className="px-5 pb-4">
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {PRESET_QUANTITIES.map((qty) => (
                            <button
                                key={qty}
                                onClick={() => handlePreset(qty)}
                                className="py-3 text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                            >
                                {qty} kg
                            </button>
                        ))}
                    </div>

                    {/* Custom Toggle */}
                    {!showCustom ? (
                        <button
                            onClick={() => setShowCustom(true)}
                            className="w-full py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            Custom quantity →
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0.5"
                                        max="50"
                                        value={customQty}
                                        onChange={(e) => {
                                            setCustomQty(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="e.g. 2.5"
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        autoFocus
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">kg</span>
                                </div>
                                <button
                                    onClick={handleCustomSubmit}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-all"
                                >
                                    Add
                                </button>
                            </div>
                            {error && <p className="text-xs text-red-500 px-1">{error}</p>}
                        </div>
                    )}
                </div>

                {/* Cancel */}
                <div className="px-5 pb-5">
                    <button
                        onClick={onCancel}
                        className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

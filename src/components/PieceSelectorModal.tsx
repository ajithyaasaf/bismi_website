'use client';

import { useState } from 'react';

interface PieceSelectorModalProps {
    productName: string;
    pricePerPiece: number;
    onSelect: (pieces: number, cuttingPreference: string) => void;
    onCancel: () => void;
}

const PRESET_PIECES = [2, 4, 6];
const CUTTING_OPTIONS = ['Whole (cleaned)', 'Curry cut'];

export default function PieceSelectorModal({
    productName,
    pricePerPiece,
    onSelect,
    onCancel,
}: PieceSelectorModalProps) {
    const [selectedPieces, setSelectedPieces] = useState<number>(2); // default 2
    const [customPieces, setCustomPieces] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [cutting, setCutting] = useState(CUTTING_OPTIONS[0]);
    const [error, setError] = useState('');

    const effectivePieces = showCustom ? parseInt(customPieces || '0', 10) : selectedPieces;
    const lineTotal = effectivePieces * pricePerPiece;

    const handleAdd = () => {
        if (!effectivePieces || effectivePieces < 1) {
            setError('Minimum 1 piece');
            return;
        }
        onSelect(effectivePieces, cutting);
    };

    const handleCustomInput = (val: string) => {
        setCustomPieces(val);
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Select Quantity</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{productName}</p>
                    <p className="text-xs text-red-600 font-medium mt-1">
                        ₹{pricePerPiece} / piece
                    </p>
                </div>

                <div className="px-5 py-4 space-y-5">
                    {/* Piece Count */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            How many pieces?
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {PRESET_PIECES.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        setSelectedPieces(p);
                                        setShowCustom(false);
                                        setError('');
                                    }}
                                    className={`py-3 text-sm font-semibold rounded-xl border-2 transition-all active:scale-95 ${!showCustom && selectedPieces === p
                                            ? 'border-red-500 bg-red-50 text-red-600'
                                            : 'border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                                        }`}
                                >
                                    {p} pcs
                                </button>
                            ))}
                        </div>
                        {!showCustom ? (
                            <button
                                onClick={() => setShowCustom(true)}
                                className="w-full py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                Custom quantity →
                            </button>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    min="1"
                                    value={customPieces}
                                    onChange={(e) => handleCustomInput(e.target.value)}
                                    placeholder="e.g. 8"
                                    className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                    autoFocus
                                />
                                <span className="text-sm text-gray-400 shrink-0">pieces</span>
                            </div>
                        )}
                        {error && <p className="text-xs text-red-500 mt-1 px-1">{error}</p>}
                    </div>

                    {/* Cutting Preference */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            How do you want it cut?
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {CUTTING_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setCutting(opt)}
                                    className={`py-2.5 px-3 text-sm font-medium rounded-xl border-2 transition-all active:scale-95 ${cutting === opt
                                            ? 'border-red-500 bg-red-50 text-red-600'
                                            : 'border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Live Total Preview */}
                    {effectivePieces > 0 && (
                        <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                {effectivePieces} pcs × ₹{pricePerPiece}
                            </span>
                            <span className="text-base font-bold text-gray-900">
                                ₹{lineTotal.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 space-y-2">
                    <button
                        onClick={handleAdd}
                        className="w-full py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-100"
                    >
                        Add to Cart
                    </button>
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

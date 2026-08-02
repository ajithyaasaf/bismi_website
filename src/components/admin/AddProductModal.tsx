'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
}

const PRESET_IMAGES = [
    { label: 'Chicken', url: '/images/chicken.jpg' },
    { label: 'Boneless', url: '/images/chicken-boneless.jpg' },
    { label: 'Lollipop', url: '/images/chicken-lollipop.jpg' },
    { label: 'Country Chicken', url: '/images/country-chicken.jpg' },
    { label: 'Mutton', url: '/images/mutton.jpg' },
    { label: 'Kaadai / Quail', url: '/images/kaadai.jpg' },
];

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
    const [name, setName] = useState('');
    const [localName, setLocalName] = useState('');
    const [category, setCategory] = useState('chicken');
    const [unit, setUnit] = useState<'kg' | 'piece'>('kg');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageURL, setImageURL] = useState(PRESET_IMAGES[0].url);
    const [customImageURL, setCustomImageURL] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedName = name.trim();
        const parsedPrice = parseFloat(price);

        if (!trimmedName) {
            setError('Please enter a product name');
            return;
        }

        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            setError('Please enter a valid price greater than 0');
            return;
        }

        const finalImageURL = customImageURL.trim() || imageURL;

        setSubmitting(true);
        try {
            const productData: Record<string, unknown> = {
                name: trimmedName,
                category,
                unit,
                imageURL: finalImageURL,
                description: description.trim() || 'Fresh, high-quality meat cut daily.',
                isActive: true,
                isAvailableToday: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            if (localName.trim()) {
                productData.localName = localName.trim();
            }

            if (unit === 'kg') {
                productData.pricePerKg = parsedPrice;
            } else {
                productData.pricePerPiece = parsedPrice;
                productData.pricePerKg = 0;
            }

            await addDoc(collection(db, 'meatTypes'), productData);

            // Reset form
            setName('');
            setLocalName('');
            setCategory('chicken');
            setUnit('kg');
            setPrice('');
            setDescription('');
            setCustomImageURL('');
            setImageURL(PRESET_IMAGES[0].url);

            onProductAdded();
            onClose();
        } catch (err) {
            console.error('Failed to add product:', err);
            setError('Failed to create product. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
                        <p className="text-xs text-gray-400">Add a new item to your shop catalog</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-sm font-bold bg-white rounded-full w-8 h-8 flex items-center justify-center border border-gray-200 shadow-xs transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Product Name & Tamil Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                English Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Mutton Curry Cut"
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Tamil Name (ஆ)
                            </label>
                            <input
                                type="text"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                placeholder="e.g. ஆட்டுக்கறி கட்"
                                lang="ta"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Category & Unit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none capitalize"
                            >
                                <option value="chicken">Chicken</option>
                                <option value="mutton">Mutton</option>
                                <option value="specialty">Specialty</option>
                                <option value="seafood">Fish & Seafood</option>
                                <option value="eggs">Eggs</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Pricing Unit *</label>
                            <div className="flex gap-2 pt-1">
                                <label className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 border text-xs font-semibold rounded-xl cursor-pointer transition-colors ${unit === 'kg' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                    <input
                                        type="radio"
                                        name="unit"
                                        value="kg"
                                        checked={unit === 'kg'}
                                        onChange={() => setUnit('kg')}
                                        className="sr-only"
                                    />
                                    Per Kg (₹/kg)
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 border text-xs font-semibold rounded-xl cursor-pointer transition-colors ${unit === 'piece' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                    <input
                                        type="radio"
                                        name="unit"
                                        value="piece"
                                        checked={unit === 'piece'}
                                        onChange={() => setUnit('piece')}
                                        className="sr-only"
                                    />
                                    Per Piece (₹/pc)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Price Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Price ({unit === 'kg' ? '₹ per Kg' : '₹ per Piece'}) *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                ₹
                            </span>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder={unit === 'kg' ? 'e.g. 240' : 'e.g. 45'}
                                required
                                className="w-full pl-8 pr-4 py-2 text-sm font-bold text-gray-900 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Image Preset Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Product Image Preset
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {PRESET_IMAGES.map((preset) => (
                                <button
                                    key={preset.url}
                                    type="button"
                                    onClick={() => {
                                        setImageURL(preset.url);
                                        setCustomImageURL('');
                                    }}
                                    className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                                        imageURL === preset.url && !customImageURL
                                            ? 'bg-red-50 border-red-500 text-red-600 font-bold'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                        <input
                            type="url"
                            value={customImageURL}
                            onChange={(e) => setCustomImageURL(e.target.value)}
                            placeholder="Or paste custom image URL..."
                            className="mt-2 w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Tender, fresh cuts cleaned and packed hygienically."
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Creating Product...' : 'Save & Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

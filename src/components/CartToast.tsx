'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartToast() {
    const { toastItem } = useCart();

    return (
        <div
            className={`fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 transition-all duration-300 pointer-events-none flex justify-center sm:justify-end ${toastItem ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'
                }`}
        >
            <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-4 py-3 min-w-[320px] max-w-sm flex items-center justify-between gap-4 pointer-events-auto border border-gray-800">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium truncate">
                        <span className="font-bold">{toastItem?.name}</span> added
                    </p>
                </div>

                <Link
                    href="/cart"
                    className="shrink-0 text-sm font-bold text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg active:scale-95"
                >
                    View Cart →
                </Link>
            </div>
        </div>
    );
}

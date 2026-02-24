'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { SHOP_CONFIG } from '@/lib/config';

import TopBar from './TopBar';

export default function Header() {
    const { itemCount } = useCart();

    return (
        <>
            <TopBar />
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <Image
                            src="/logo.jpg"
                            alt={SHOP_CONFIG.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                            priority
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                                {SHOP_CONFIG.name}
                            </h1>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href="/menu"
                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            Menu
                        </Link>
                        <Link
                            href="/cart"
                            className="relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                            </svg>
                            Cart
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-600 rounded-full px-1">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    </nav>
                </div>
            </header>
        </>
    );
}

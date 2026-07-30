'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { CATEGORIES } from '@/lib/config';

type CategoryId = (typeof CATEGORIES)[number]['id'];

export default function CategoryGrid() {
  const [visibleIds, setVisibleIds] = useState<Set<CategoryId> | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setVisibleIds(new Set(CATEGORIES.map((c) => c.id)));
      return;
    }

    let cancelled = false;

    async function checkVisibility() {
      try {
        const checks = await Promise.all(
          CATEGORIES.map(async (cat) => {
            const q = query(
              collection(db, 'meatTypes'),
              where('category', '==', cat.id),
              where('isActive', '==', true),
              limit(1)
            );
            const snap = await getDocs(q);
            return { id: cat.id, hasActive: !snap.empty };
          })
        );

        if (cancelled) return;

        const visible = new Set<CategoryId>(
          checks.filter((c) => c.hasActive).map((c) => c.id)
        );

        setVisibleIds(visible);
      } catch {
        if (!cancelled) {
          setVisibleIds(new Set(CATEGORIES.map((c) => c.id)));
        }
      }
    }

    checkVisibility();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative bg-[#fbf9f5] pt-12 sm:pt-16 pb-0 overflow-hidden select-none">
      {/* ─── Background Corner Spices & Herbs ─── */}
      <div className="absolute top-0 left-0 z-0 pointer-events-none w-20 sm:w-48 lg:w-60 max-w-[20vw] sm:max-w-[28vw] opacity-90">
        <Image
          src="/assets/images/menu-section/top_left_spices.png"
          alt="Top Left Spices"
          width={400}
          height={400}
          className="w-full h-auto object-contain"
        />
      </div>

      <div className="absolute top-0 right-0 z-0 pointer-events-none w-20 sm:w-48 lg:w-60 max-w-[20vw] sm:max-w-[28vw] opacity-90">
        <Image
          src="/assets/images/menu-section/top_right_herbs.png"
          alt="Top Right Herbs"
          width={400}
          height={400}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* ─── Bottom Corner Lineart Watermarks ─── */}
      <div className="absolute bottom-16 sm:bottom-24 left-0 z-0 pointer-events-none w-40 sm:w-64 opacity-25 mix-blend-multiply">
        <Image
          src="/assets/images/menu-section/cow_lineart.png"
          alt="Cow Lineart Watermark"
          width={400}
          height={400}
          className="w-full h-auto object-contain"
        />
      </div>

      <div className="absolute bottom-16 sm:bottom-24 right-0 z-0 pointer-events-none w-40 sm:w-64 opacity-25 mix-blend-multiply">
        <Image
          src="/assets/images/menu-section/chicken_lineart.png"
          alt="Chicken Lineart Watermark"
          width={400}
          height={400}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* ─── Decorative Dotted Matrices ─── */}
      <div className="absolute top-28 left-6 sm:left-12 z-0 pointer-events-none hidden sm:block opacity-30 text-[#d8c3a5]">
        <svg width="60" height="60" fill="currentColor">
          <pattern id="dots-left" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" />
          </pattern>
          <rect width="60" height="60" fill="url(#dots-left)" />
        </svg>
      </div>

      <div className="absolute bottom-32 right-6 sm:right-12 z-0 pointer-events-none hidden sm:block opacity-30 text-[#d8c3a5]">
        <svg width="60" height="60" fill="currentColor">
          <pattern id="dots-right" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" />
          </pattern>
          <rect width="60" height="60" fill="url(#dots-right)" />
        </svg>
      </div>

      {/* ─── Header Content ─── */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4 mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 text-[#556b2f] text-lg sm:text-2xl font-cursive-accent font-medium mb-1">
          <span className="text-sm">⇥</span>
          <span>Quality ingredients, Freshly prepared</span>
          <span className="text-sm">⇤</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#1e293b] font-serif-luxury tracking-tight mb-3">
          Explore Our Menu
        </h2>

        <p className="text-xs sm:text-base text-gray-500 font-medium mb-4 tracking-wide">
          Handpicked cuts. Hygienically packed. Delivered with care.
        </p>

        {/* Fork & Spoon Divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-12 sm:w-16 bg-[#e8bebe]" />
          <svg className="w-5 h-5 text-[#d9777f]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm8-7h-1.5C15.01 2 13.5 3.51 13.5 6v6h2.5v10h2.5V2z" />
          </svg>
          <div className="h-[1px] w-12 sm:w-16 bg-[#e8bebe]" />
        </div>
      </div>

      {/* ─── Menu Cards Grid ─── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
        {/* Mutton Card */}
        <Link
          href="/menu?category=mutton"
          className="group relative rounded-[28px] p-6 sm:p-8 bg-[#fdf1f1] border border-[#f7dede] hover:border-[#f3caca] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 overflow-hidden"
        >
          <div className="flex-1 text-center sm:text-left z-10">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#8d3741] font-serif-luxury mb-2">
              Mutton
            </h3>
            <div className="w-8 h-[2px] bg-[#8d3741]/20 mx-auto sm:mx-0 mb-3" />
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 max-w-xs">
              Tender & juicy mutton cuts, perfect for your traditional recipes.
            </p>
            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#a3444e] group-hover:bg-[#8b363f] text-white text-xs sm:text-sm font-medium shadow-md transition-all">
              Explore Mutton
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>

          <div className="relative w-44 h-44 sm:w-56 sm:h-56 shrink-0 group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl">
            <Image
              src="/assets/images/menu-section/mutton_plate.png"
              alt="Fresh Mutton Cuts"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Chicken Card */}
        <Link
          href="/menu?category=chicken"
          className="group relative rounded-[28px] p-6 sm:p-8 bg-[#fdf7ec] border border-[#f7ebd4] hover:border-[#f2ddb8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 overflow-hidden"
        >
          <div className="flex-1 text-center sm:text-left z-10">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#c48227] font-serif-luxury mb-2">
              Chicken
            </h3>
            <div className="w-8 h-[2px] bg-[#c48227]/20 mx-auto sm:mx-0 mb-3" />
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 max-w-xs">
              Fresh & hygienic chicken cuts, ideal for everyday meals and special feasts.
            </p>
            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#d89129] group-hover:bg-[#be7d1e] text-white text-xs sm:text-sm font-medium shadow-md transition-all">
              Explore Chicken
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>

          <div className="relative w-44 h-44 sm:w-56 sm:h-56 shrink-0 group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl">
            <Image
              src="/assets/images/menu-section/chicken_plate.png"
              alt="Fresh Chicken Cuts"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* ─── Integrated Trust Badges Row ─── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
        {/* 100% Fresh */}
        <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100/80 shadow-xs">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e6efdf] text-[#4d6638] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">100% Fresh</h4>
            <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Farm fresh & high quality</p>
          </div>
        </div>

        {/* Hygienically Packed */}
        <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100/80 shadow-xs">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#fce8eb] text-[#a3444e] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Hygienically Packed</h4>
            <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Packed with care & safety</p>
          </div>
        </div>

        {/* On-Time Delivery */}
        <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100/80 shadow-xs">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#fef4e2] text-[#d89129] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">On-Time Delivery</h4>
            <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Delivered fresh to your door</p>
          </div>
        </div>

        {/* Trusted Quality */}
        <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100/80 shadow-xs">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e7ede8] text-[#556b2f] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Trusted Quality</h4>
            <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">Sourced from trusted local farms</p>
          </div>
        </div>
      </div>

      {/* ─── Bottom Organic Wave Transition ─── */}
      <div className="w-full overflow-hidden leading-none z-0 relative">
        <svg
          className="relative block w-full h-16 sm:h-24 lg:h-32 text-brand-burgundy"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}

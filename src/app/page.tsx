import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TodayAvailableStrip from '@/components/TodayAvailableStrip';
import CategoryGrid from '@/components/CategoryGrid';
import BestSellers from '@/components/BestSellers';
import Testimonials from '@/components/Testimonials';
import WhyChooseUs from '@/components/WhyChooseUs';
import VisitOurShop from '@/components/VisitOurShop';
import TrackedLink from '@/components/TrackedLink';
import { SHOP_CONFIG } from '@/lib/config';

import desktopBanner from '../../public/assets/images/hero-sections/desktop-2.png';
import mobileBanner from '../../public/assets/images/hero-sections/mobile-1.png';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────── */}
        <section className="relative w-full bg-black">
          {/* Desktop Banner Image */}
          <div className="hidden sm:block w-full">
            <Image
              src={desktopBanner}
              alt="Bismi Broilers Hero Banner"
              priority
              className="w-full h-auto block"
            />
          </div>

          {/* Mobile Banner Image */}
          <div className="block sm:hidden w-full">
            <Image
              src={mobileBanner}
              alt="Bismi Broilers Mobile Banner"
              priority
              className="w-full h-auto block"
            />
          </div>
        </section>

        {/* ─── Today Available Strip ──────────────── */}
        <TodayAvailableStrip />

        {/* ─── Best Sellers Section ───────────────── */}
        <BestSellers />

        {/* ─── Explore Our Menu Section ───────────── */}
        <CategoryGrid />

        {/* ─── Testimonials ───────────────────────── */}
        <Testimonials />

        {/* ─── Why Choose Us ──────────────────────── */}
        <WhyChooseUs />

        {/* ─── Location & Contact Section ─────────── */}
        <VisitOurShop />
      </main>
      <Footer />
    </>
  );
}

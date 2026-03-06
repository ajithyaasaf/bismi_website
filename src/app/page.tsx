import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CloudinaryVideo from '@/components/CloudinaryVideo';
import TodayAvailableStrip from '@/components/TodayAvailableStrip';
import CategoryGrid from '@/components/CategoryGrid';
import BestSellers from '@/components/BestSellers';
import TrustBadges from '@/components/TrustBadges';
import Testimonials from '@/components/Testimonials';
import WhyChooseUs from '@/components/WhyChooseUs';
import TrackedLink from '@/components/TrackedLink';
import { SHOP_CONFIG } from '@/lib/config';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────── */}
        <section className="relative w-full bg-black">
          {/* Desktop Banner Video (Cloudinary) */}
          <div className="hidden sm:block">
            <CloudinaryVideo
              publicId="bismi-broilers/hero_banner_video_v2"
              className="w-full h-auto block"
            />
          </div>

          {/* Mobile Banner Video (Local) */}
          <div className="block sm:hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-auto block"
            >
              <source src="/assets/images/banner_mobile.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* ─── Today Available Strip ──────────────── */}
        <TodayAvailableStrip />

        {/* ─── Best Sellers Section ───────────────── */}
        <BestSellers />

        {/* ─── Categories Section ─────────────────── */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Explore Our Menu</h2>
            <p className="text-gray-500 font-medium">Find exactly what you are looking for</p>
          </div>
          <CategoryGrid />
        </section>

        {/* ─── Trust Badges ───────────────────────── */}
        <TrustBadges />

        {/* ─── Testimonials ───────────────────────── */}
        <Testimonials />

        {/* ─── Why Choose Us ──────────────────────── */}
        <WhyChooseUs />

        {/* ─── Location & Contact ─────────────────── */}
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Visit Our Shop</h2>
              <p className="text-gray-500 font-medium">{SHOP_CONFIG.address}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={SHOP_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.274 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                </svg>
                Get Directions
              </a>
              <TrackedLink
                href={`https://wa.me/${SHOP_CONFIG.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                eventAction="whatsapp_contact_click"
                eventCategory="engagement"
                eventLabel="homepage"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
                </svg>
                WhatsApp Us
              </TrackedLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

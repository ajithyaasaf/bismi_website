import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CloudinaryVideo from '@/components/CloudinaryVideo';
import { SHOP_CONFIG, CATEGORIES } from '@/lib/config';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────── */}
        <section className="relative w-full bg-black">
          <CloudinaryVideo
            publicId="bismi-broilers/hero_banner_video"
            className="w-full h-auto block"
          />
        </section>

        {/* ─── Categories Section ────────────────── */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What&apos;s on the Menu?</h2>
            <p className="text-gray-500">Fresh cuts, delivered daily</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto sm:max-w-none sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.id}`}
                className="group relative bg-white rounded-2xl p-5 sm:p-6 text-center border border-gray-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 transition-all active:scale-[0.97]"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 relative drop-shadow-sm group-hover:scale-110 transition-transform">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-400 hidden sm:block">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── USP Section ───────────────────────── */}
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🥩', title: 'Fresh Daily', desc: 'Sourced & cut fresh every morning' },
                { icon: '🚚', title: 'Free Delivery', desc: 'Free delivery on all orders' },
                { icon: '💰', title: 'Cash on Delivery', desc: 'Pay when you receive' },
                { icon: '📱', title: 'Easy Ordering', desc: 'Order in under 2 minutes' },
              ].map((usp) => (
                <div key={usp.title} className="text-center">
                  <div className="text-3xl mb-2">{usp.icon}</div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{usp.title}</h3>
                  <p className="text-xs text-gray-500">{usp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Delivery Info ─────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-red-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                🛵
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Free Delivery on Every Order!</h3>
                <p className="text-sm text-gray-600 mb-2">
                  We deliver to all areas within town — <strong>absolutely free</strong>, no minimum for delivery.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Minimum order: {SHOP_CONFIG.currency}{SHOP_CONFIG.minimumOrderAmount}</li>
                  <li>• Estimated time: {SHOP_CONFIG.estimatedDeliveryTime}</li>
                  <li>• Payment: Cash on Delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Location & Contact ─────────────────── */}
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Visit Our Shop</h2>
              <p className="text-gray-500">{SHOP_CONFIG.address}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={SHOP_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.274 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                </svg>
                Get Directions
              </a>
              <a
                href={`https://wa.me/${SHOP_CONFIG.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

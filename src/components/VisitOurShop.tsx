import TrackedLink from '@/components/TrackedLink';
import { SHOP_CONFIG } from '@/lib/config';

export default function VisitOurShop() {
  return (
    <section className="bg-white border-t border-gray-100 py-16 px-4 select-none">
      <div className="max-w-5xl mx-auto">
        
        {/* ─── Top Floating Location Pin Icon ─── */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#c81e1e]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        </div>

        {/* ─── Section Header ─── */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            Visit Our <span className="text-[#c81e1e]">Shop</span>
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {SHOP_CONFIG.address}
          </p>
        </div>

        {/* ─── Action Buttons ─── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <a
            href={SHOP_CONFIG.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#0b1329] hover:bg-[#162447] text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#00c853] hover:bg-[#00a843] text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
            </svg>
            WhatsApp Us
          </TrackedLink>
        </div>

        {/* ─── Integrated Feature Strip Container ─── */}
        <div className="bg-[#f8fafc] border border-gray-100 rounded-3xl p-5 sm:p-6 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
          
          {/* Feature 1: Easy to Find */}
          <div className="flex items-center gap-3.5 sm:justify-center">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs text-gray-800 flex items-center justify-center shrink-0 border border-gray-100">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Easy to Find</h4>
              <p className="text-xs text-gray-500">Prime location</p>
            </div>
          </div>

          {/* Feature 2: Store Pickup */}
          <div className="flex items-center gap-3.5 sm:justify-center">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs text-gray-800 flex items-center justify-center shrink-0 border border-gray-100">
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Store Pickup</h4>
              <p className="text-xs text-gray-500">Order online & collect</p>
            </div>
          </div>

          {/* Feature 3: Open Daily */}
          <div className="flex items-center gap-3.5 sm:justify-center">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs text-gray-800 flex items-center justify-center shrink-0 border border-gray-100">
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Open Daily</h4>
              <p className="text-xs text-gray-500">{SHOP_CONFIG.workingHours}</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

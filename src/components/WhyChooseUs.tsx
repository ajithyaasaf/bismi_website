import Image from 'next/image';
import { SHOP_CONFIG } from '@/lib/config';

export default function WhyChooseUs() {
  return (
    <section className="relative bg-[#fbf9f5] py-16 sm:py-24 overflow-hidden select-none">
      {/* ─── Bottom-Left Farm Lineart Watermark ─── */}
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none w-72 sm:w-96 lg:w-[520px] opacity-20 mix-blend-multiply">
        <Image
          src="/assets/images/why-choose-us/farm_lineart_bg.png"
          alt="Farm Lineart Background"
          width={1000}
          height={600}
          className="w-full h-auto object-contain object-bottom-left"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* ─── Left Column: Process Steps ─── */}
          <div className="lg:col-span-6">
            <span className="text-[#c81e1e] font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 block">
              HOW WE WORK
            </span>

            <h2 className="text-3xl sm:text-5xl lg:text-5xl font-semibold text-[#1e293b] font-serif-luxury tracking-tight leading-tight mb-4">
              Fresh From Farm <br />
              <span className="text-[#2d5a3f]">To Your Table</span>
            </h2>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              We&apos;ve eliminated the middlemen to bring you the highest quality meat, faster and fresher than your local market.
            </p>

            {/* Step Timeline Container */}
            <div className="relative space-y-5 sm:space-y-6 max-w-xl">
              {/* Vertical Pink Dashed Timeline Line */}
              <div className="absolute left-[27px] sm:left-[31px] top-8 bottom-8 w-[2px] border-l-2 border-dashed border-[#e8a5a5] z-0" />

              {/* Step 01 */}
              <div className="relative flex items-center gap-4 sm:gap-5 z-10 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-md flex items-center justify-center p-1.5 shrink-0 z-10 group-hover:scale-105 transition-transform">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#fde8ea] flex items-center justify-center text-[#1e293b]">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5 3C15 3 13 5 12 6.5C11 5 9 3 6.5 3C3.5 3 1.5 5.5 1.5 8.5C1.5 13.5 12 21 12 21C12 21 22.5 13.5 22.5 8.5C22.5 5.5 20.5 3 17.5 3Z" fill="none" />
                      <path d="M21 3C17 3 13 6 12 10C11 6 7 3 3 3C3 10 7 14 12 21C17 14 21 10 21 3Z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100/90 group-hover:border-red-100 group-hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#c81e1e] font-bold text-sm sm:text-base">01</span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Sourced Fresh Daily</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    We partner with local farms and source only the best, freshest meat every morning.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative flex items-center gap-4 sm:gap-5 z-10 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-md flex items-center justify-center p-1.5 shrink-0 z-10 group-hover:scale-105 transition-transform">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#fde8ea] flex items-center justify-center text-[#1e293b]">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.778 4.222c-2.343-2.344-6.142-2.344-8.485 0L3.121 12.393c-.39.39-.39 1.024 0 1.415l4.243 4.242c.39.391 1.024.391 1.414 0l8.172-8.172c2.343-2.343 2.343-6.142 0-8.485zm-2.122 6.364l-6.757 6.757-2.828-2.828 6.757-6.757 2.828 2.828z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100/90 group-hover:border-red-100 group-hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#c81e1e] font-bold text-sm sm:text-base">02</span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Custom Cleaned & Cut</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Prepared to your exact preference in our state-of-the-art hygienic facility.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative flex items-center gap-4 sm:gap-5 z-10 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-md flex items-center justify-center p-1.5 shrink-0 z-10 group-hover:scale-105 transition-transform">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#fde8ea] flex items-center justify-center text-[#1e293b]">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h1c.55 0 1-.45 1-1v-5l-3-4zM6 19.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM16 11V8.5h2.5l2.1 2.5H16z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100/90 group-hover:border-red-100 group-hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#c81e1e] font-bold text-sm sm:text-base">03</span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Fast, Free Delivery</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Delivered quickly to your doorstep, absolutely free.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Delivery Card ─── */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-[#c81e1e] via-[#b71c1c] to-[#991515] p-6 sm:p-10 shadow-2xl border border-red-700/30 text-white z-10">
              
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold text-white mb-5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Delivering Now
              </div>

              {/* Delivery Title */}
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-luxury leading-tight mb-3 text-white">
                Free Delivery <br />
                On Every Order!
              </h3>

              <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-6 max-w-xs sm:max-w-sm">
                We deliver to all areas within town absolutely free. No hidden fees, no surge pricing.
              </p>

              {/* 3D Scooter Delivery Rider Image */}
              <div className="absolute -top-4 -right-4 sm:-top-8 sm:-right-8 w-44 sm:w-60 lg:w-72 h-auto pointer-events-none z-20 drop-shadow-2xl">
                <Image
                  src="/assets/images/why-choose-us/delivery_guy_scooter.png"
                  alt="3D Delivery Scooter Rider"
                  width={800}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>

              {/* 3 Feature Highlight Cards */}
              <div className="space-y-3 relative z-10 max-w-md">
                {/* Feature 1 */}
                <div className="flex items-center gap-3.5 bg-black/20 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10 hover:bg-black/25 transition-all">
                  <div className="w-10 h-10 rounded-full bg-white text-[#b71c1c] flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">{SHOP_CONFIG.estimatedDeliveryTime}</h4>
                    <p className="text-xs text-white/70">Guaranteed Service</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3.5 bg-black/20 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10 hover:bg-black/25 transition-all">
                  <div className="w-10 h-10 rounded-full bg-white text-[#b71c1c] flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Cash on Delivery</h4>
                    <p className="text-xs text-white/70">Pay when you receive</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3.5 bg-black/20 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10 hover:bg-black/25 transition-all">
                  <div className="w-10 h-10 rounded-full bg-white text-[#b71c1c] flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">{SHOP_CONFIG.currency}{SHOP_CONFIG.minimumOrderAmount} Min Order</h4>
                    <p className="text-xs text-white/70">For free delivery to apply</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Right Leaf Sprig PNG */}
            <div className="absolute -bottom-8 -right-8 w-28 sm:w-40 lg:w-48 h-auto pointer-events-none z-20 drop-shadow-lg">
              <Image
                src="/assets/images/why-choose-us/bottom_right_leaf.png"
                alt="Leaf Sprig Decorator"
                width={500}
                height={500}
                className="w-full h-auto object-contain"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

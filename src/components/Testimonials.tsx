import Image from 'next/image';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Fathima',
      text: '“Very affordable pricing, same rates as the physical shop! The meat is extremely fresh and delivered with great care.”',
      rating: 5,
      tag: 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Sarah M.',
      text: 'Always tender and hygienically packed. The best chicken I\'ve ordered in town. Delivery is super fast too!”',
      rating: 5,
      tag: 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Rajesh K.',
      text: 'No more messy market visits. The meat comes perfectly cleaned and custom cut just the way my mom likes it.”',
      rating: 5,
      tag: 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <section className="relative bg-white py-16 sm:py-24 px-4 overflow-hidden select-none">
      
      {/* ─── Background Decorative Elements (Exact Match) ─── */}
      {/* Top Right: Pink Ring Outline Circle */}
      <div className="absolute top-10 right-10 sm:right-24 w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-[#fcd5d9] bg-transparent pointer-events-none z-0" />
      
      {/* Right Side: Soft Pink Circle */}
      <div className="absolute top-1/3 -right-12 sm:-right-16 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-[#fde8ea]/70 pointer-events-none z-0" />
      
      {/* Left Side Middle: Floating Soft Pink Heart */}
      <div className="absolute top-1/2 left-4 sm:left-12 text-[#f8c8cb] pointer-events-none z-0 transform -rotate-12">
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Left Side Bottom: Soft Pink Circle */}
      <div className="absolute bottom-6 -left-12 sm:-left-16 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-[#fde8ea]/70 pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ─── Top Badge ─── */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fde8ea] text-[#e02424] text-xs font-bold tracking-wider uppercase">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Trusted By Our Community</span>
          </div>
        </div>

        {/* ─── Main Heading ─── */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] text-center tracking-tight mb-2">
          Loved By Over 500+ Local Families
        </h2>

        {/* ─── Heart Divider ─── */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-[#f5b8bc]" />
          <svg className="w-3.5 h-3.5 text-[#e02424]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <div className="h-[1px] w-8 bg-[#f5b8bc]" />
        </div>

        {/* ─── Sub-description ─── */}
        <p className="text-gray-500 font-medium text-sm sm:text-base text-center mb-10 sm:mb-12">
          Don&apos;t just take our word for it.
        </p>

        {/* ─── Testimonials Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Solid Crimson Red Stars */}
                <div className="flex gap-1.5 text-[#e02424] mb-4 text-base">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Soft Pink Double Quote SVG Icon */}
                <div className="text-[#f8b4b8] mb-3">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-normal mb-8">
                  {review.text}
                </p>
              </div>

              {/* Reviewer Profile Footer */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-gray-50 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 shadow-2xs">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base leading-tight">
                    {review.name}
                  </h4>
                  <p className="text-xs text-[#10b981] font-semibold">
                    {review.tag}
                  </p>
                </div>
                
                {/* Exact Red Rosette Scalloped Verified Seal Badge Outline */}
                <svg className="w-7 h-7 text-[#e02424] shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

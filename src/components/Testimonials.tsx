export default function Testimonials() {
    const reviews = [
        {
            name: "Sarah M.",
            text: "Always tender and hygienically packed. The best chicken I've ordered in town. Delivery is super fast too!",
            rating: 5,
            tag: "Verified Buyer"
        },
        {
            name: "Rajesh K.",
            text: "No more messy market visits. The meat comes perfectly cleaned and custom cut just the way my mom likes it.",
            rating: 5,
            tag: "Verified Buyer"
        },
        {
            name: "Priya T.",
            text: "I was skeptical about buying raw meat online, but the quality here is excellent. No strange smells, very fresh.",
            rating: 5,
            tag: "Verified Buyer"
        }
    ];

    return (
        <section className="bg-white max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Loved By Over 500+ Local Families</h2>
                <p className="text-gray-500">Don't just take our word for it.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((review, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex gap-1 mb-4 text-amber-400">
                            {[...Array(review.rating)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-700 italic mb-6 flex-1">&quot;{review.text}&quot;</p>
                        <div>
                            <p className="font-bold text-gray-900">{review.name}</p>
                            <p className="text-xs text-green-600 font-semibold">{review.tag}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

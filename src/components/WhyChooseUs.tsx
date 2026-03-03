import { SHOP_CONFIG } from '@/lib/config';

export default function WhyChooseUs() {
    return (
        <section className="bg-gray-50 border-t border-gray-100 overflow-hidden relative">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-5 w-96 h-96 bg-[radial-gradient(circle,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_70%)] rounded-full hidden lg:block pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left side: Steps/Farm to Table */}
                    <div>
                        <div className="mb-10">
                            <span className="text-red-600 font-bold tracking-wider uppercase text-sm mb-2 block">How We Work</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Fresh From Farm To Your Table</h2>
                            <p className="mt-4 text-gray-600 text-lg">We&apos;ve eliminated the middlemen to bring you the highest quality meat, faster and fresher than your local market.</p>
                        </div>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {[
                                {
                                    step: "01",
                                    title: 'Sourced Fresh Daily',
                                    desc: 'Early morning sourcing ensures you only get meat processed the very same day.',
                                    icon: '🐓'
                                },
                                {
                                    step: "02",
                                    title: 'Custom Cleaned & Cut',
                                    desc: 'Prepared to your exact preference in our state-of-the-art hygienic facility.',
                                    icon: '🔪'
                                },
                                {
                                    step: "03",
                                    title: 'Fast, Free Delivery',
                                    desc: `Delivered to your doorstep in ${SHOP_CONFIG.estimatedDeliveryTime}, absolutely free.`,
                                    icon: '🛵'
                                },
                            ].map((item, index) => (
                                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white bg-red-100 text-red-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                                        <span className="text-xl">{item.icon}</span>
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group-hover:border-red-100 group-hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold text-gray-300">{item.step}</span>
                                            <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Delivery Promise Card */}
                    <div className="lg:pl-8">
                        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 sm:p-10 text-white shadow-2xl shadow-red-900/20 relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
                                    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 0 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
                                    <path d="M8.25 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
                                    <path d="M19.5 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-6">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    Delivering Now
                                </div>

                                <h3 className="text-3xl font-extrabold mb-4 leading-tight">Free Delivery <br />On Every Order!</h3>
                                <p className="text-red-100 text-lg mb-8 leading-relaxed max-w-sm">
                                    We deliver to all areas within town absolutely free. No hidden fees, no surge pricing.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                        <div className="mr-4 mt-1 opacity-80">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{SHOP_CONFIG.estimatedDeliveryTime}</p>
                                            <p className="text-sm text-red-200">Average Delivery Time</p>
                                        </div>
                                    </div>

                                    <div className="flex bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                        <div className="mr-4 mt-1 opacity-80">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Cash on Delivery</p>
                                            <p className="text-sm text-red-200">Pay when you receive</p>
                                        </div>
                                    </div>

                                    <div className="flex bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                        <div className="mr-4 mt-1 opacity-80">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{SHOP_CONFIG.currency}{SHOP_CONFIG.minimumOrderAmount} Min Order</p>
                                            <p className="text-sm text-red-200">For free delivery to apply</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

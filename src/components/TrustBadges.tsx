export default function TrustBadges() {
    const badges = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
            ),
            title: "100% Quality Checked",
            description: "Strict hygiene protocols applied"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                </svg>
            ),
            title: "Fresh from Farm",
            description: "No preservatives added"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-orange-600 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>

            ),
            title: "Perfectly Cleaned",
            description: "Ready to cook portions"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-600 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25a9 9 0 0 0-9-9h-2.25a1.125 1.125 0 0 0-1.125 1.125v2.25M16.5 18.75V15.75L12 15.75m6.375-9.75H12M12 15.75V1.5m-3.375 14.25h1.125" />
                </svg>
            ),
            title: "Delivery at your doorstep",
            description: "Fast & fresh home delivery"
        }
    ];

    return (
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 border-y border-green-100">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-green-900 mb-3 tracking-tight">Only The Best For Your Family</h2>
                    <p className="text-green-700 font-medium">We maintain strict hygiene standards at every step, ensuring you get the cleanest, freshest meat possible.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {badges.map((badge, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100/50 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-sm">
                                {badge.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{badge.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-500">{badge.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
            {/* Image Placeholder */}
            <div className="relative aspect-[4/3] bg-gray-200 shrink-0" />

            {/* Content Placeholder */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                <div className="h-3 bg-gray-100 rounded-md w-full mt-2" />
                <div className="h-3 bg-gray-100 rounded-md w-5/6" />
                <div className="mt-auto"></div>
            </div>

            {/* Bottom Action Area Placeholder */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0">
                {/* Mobile */}
                <div className="flex flex-col gap-2 sm:hidden">
                    <div className="h-5 bg-gray-200 rounded-md w-1/3" />
                    <div className="h-8 bg-gray-200 rounded-xl w-full" />
                </div>
                {/* Desktop */}
                <div className="hidden sm:flex items-end justify-between gap-2">
                    <div className="h-6 bg-gray-200 rounded-md w-1/3" />
                    <div className="h-10 bg-gray-200 rounded-xl w-20 shrink-0" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8, className = "" }: { count?: number, className?: string }) {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

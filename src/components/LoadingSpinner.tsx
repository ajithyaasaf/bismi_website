export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
            <div
                className={`${sizeClasses[size]} border-gray-200 border-t-red-600 rounded-full animate-spin`}
            />
            {text && <p className="text-sm text-gray-500">{text}</p>}
        </div>
    );
}

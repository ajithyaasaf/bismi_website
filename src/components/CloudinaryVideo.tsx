'use client';

interface CloudinaryVideoProps {
    publicId: string;
    className?: string;
}

/**
 * A senior-approach optimized video player for Cloudinary.
 * We construct the URL with 'f_auto,q_auto' to let Cloudinary serve 
 * the smartest codec (webm, hvc1, mp4) based on the user's browser, 
 * saving massive amounts of bandwidth compared to local static files.
 */
export default function CloudinaryVideo({ publicId, className = '' }: CloudinaryVideoProps) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgkys4vzj';

    // Cloudinary automatically handles transcoding on the fly with f_auto,q_auto
    const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto/${publicId}`;

    // Magically create a poster image from the first frame of the video
    // by simply grabbing the video URL and appending .jpg 
    // (f_auto will automatically convert it to WebP/AVIF if the browser supports it!)
    const posterUrl = `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto/${publicId}.jpg`;

    return (
        <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={posterUrl}
            className={className}
        >
            <source src={videoUrl} type="video/mp4" />

            Your browser does not support the video tag.
        </video>
    );
}

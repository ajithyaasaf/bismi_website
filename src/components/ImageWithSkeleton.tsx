'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithSkeletonProps extends Omit<ImageProps, 'className'> {
    containerClassName?: string;
    imageClassName?: string;
}

export default function ImageWithSkeleton({
    src,
    alt,
    containerClassName = '',
    imageClassName = '',
    ...props
}: ImageWithSkeletonProps) {
    const [isImageLoading, setIsImageLoading] = useState(true);

    return (
        <div className={`relative bg-gray-100 overflow-hidden ${containerClassName} ${isImageLoading ? 'animate-pulse' : ''}`}>
            <Image
                src={src}
                alt={alt}
                className={`transition-all duration-500 ease-out ${isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${imageClassName}`}
                onLoad={() => setIsImageLoading(false)}
                {...props}
            />
        </div>
    );
}

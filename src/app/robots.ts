import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/checkout', '/order-confirmation/'],
            },
        ],
        sitemap: 'https://bismibroilers.com/sitemap.xml',
    };
}

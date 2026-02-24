import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import { SHOP_CONFIG } from '@/lib/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#D32F2F',
};

export const metadata: Metadata = {
  title: {
    default: `${SHOP_CONFIG.name} — Fresh Meat Delivery`,
    template: `%s | ${SHOP_CONFIG.name}`,
  },
  description: `Order fresh chicken, beef, mutton & fish online from ${SHOP_CONFIG.name}. Fast local delivery & pickup available. Cash on delivery.`,
  keywords: ['fresh meat', 'chicken delivery', 'meat shop', 'online meat order', 'bismi broilers', 'local delivery'],
  authors: [{ name: SHOP_CONFIG.name }],
  creator: SHOP_CONFIG.name,
  metadataBase: new URL('https://bismibroilers.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: SHOP_CONFIG.name,
    title: `${SHOP_CONFIG.name} — Fresh Meat Delivery`,
    description: `Order fresh chicken, beef, mutton & fish online. Fast local delivery.`,
    images: [{ url: '/logo.jpg', width: 512, height: 512, alt: SHOP_CONFIG.name }],
  },
  twitter: {
    card: 'summary',
    title: SHOP_CONFIG.name,
    description: `Order fresh meat online from ${SHOP_CONFIG.name}`,
    images: ['/logo.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://bismibroilers.com',
  name: SHOP_CONFIG.name,
  description: `Fresh meat delivery — chicken, beef, mutton, fish. Order online for pickup or local delivery.`,
  url: 'https://bismibroilers.com',
  telephone: SHOP_CONFIG.phone,
  email: SHOP_CONFIG.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SHOP_CONFIG.address,
    addressLocality: 'Kerala',
    addressCountry: 'IN',
  },
  image: 'https://bismibroilers.com/logo.jpg',
  priceRange: '₹₹',
  openingHours: 'Mo-Su 07:00-20:00',
  paymentAccepted: 'Cash',
  currenciesAccepted: 'INR',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background text-foreground">
        <CartProvider>
          <ServiceWorkerRegistrar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

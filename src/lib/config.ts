/**
 * Central business configuration.
 * Update these values to match your shop details.
 */
export const SHOP_CONFIG = {
    name: 'Bismi Broilers',
    tagline: 'Fresh Meat, Delivered to Your Door',
    phone: '+918681087082',
    whatsapp: '918681087082', // Without + for wa.me link
    email: 'bismibroilers@gmail.com',
    address: 'பிஸ்மி பிராய்லர்ஸ், ஹயர்நிஷா மருத்துவமனை அருகில், (SBI ATM) எதிரில், முதுகுளத்தூர்',
    googleMapsUrl: 'https://maps.google.com/?q=Bismi+Broilers',
    workingHours: '7:00 AM – 8:00 PM',
    workingDays: 'Monday – Sunday',

    // Order rules
    minimumOrderAmount: 100, // ₹
    deliveryCharge: 0,       // ₹ — Always free delivery
    estimatedDeliveryTime: '30–45 minutes',

    // Currency
    currency: '₹',
    currencyCode: 'INR',
} as const;

/**
 * Meat categories for grouping products on homepage.
 */
export const CATEGORIES = [
    { id: 'chicken', name: 'Chicken', image: '/assets/images/Category images/chicken.avif', description: 'Fresh broiler chicken cuts' },
    { id: 'kadai', name: 'Quail', image: '/assets/images/Category images/quail.png', description: 'Fresh quail — kaadai' },
] as const;

/**
 * Order status labels and colors for UI display.
 */
export const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
    accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
} as const;

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
 * Sub-category grouping for the Chicken menu.
 * Products not listed here will fall into an "Others" category.
 */
export const CHICKEN_GROUPS = [
    {
        label: 'Everyday Cuts',
        names: ['Chicken Curry Cut', 'Chicken Small Curry Cut', 'Chicken Gravy Cut', 'Chicken Biriyani Cut']
    },
    {
        label: 'Special Cuts',
        names: ['Chicken Boneless', 'Chicken Breast', 'Chicken Leg', 'Chicken Wings', 'Chicken Lollipop', 'Chicken Keema']
    },
    {
        label: 'Country & Whole',
        names: ['Country Chicken (Nattu Kozhi)']
    },
];

/**
 * Meat categories for grouping products on homepage.
 */
export const CATEGORIES = [
    { id: 'chicken', name: 'Chicken', emoji: '🐔', image: '/assets/images/Category images/chicken.avif', description: 'Fresh broiler chicken cuts' },
    { id: 'kadai', name: 'Quail', emoji: '🐦', image: '/assets/images/Category images/quail.png', description: 'Fresh quail — kaadai' },
] as const;

/**
 * Order status labels and colors for UI display.
 */
export const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
    confirmed: { label: 'Confirmed', color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
    accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
} as const;

/**
 * Predefined delivery time slots for customer checkout.
 */
export const DELIVERY_SLOTS = [
    'Morning (7AM – 10AM)',
    'Afternoon (12PM – 3PM)',
    'Evening (4PM – 7PM)',
] as const;

/**
 * Buffer time in minutes before a delivery slot.
 * Customer can order for a slot only if: now < (slot start − buffer).
 * NOT editable in admin — config only.
 */
export const BUFFER_TIME_MINUTES = 60;

/**
 * Default max orders per slot when no Firestore control document exists.
 */
export const DEFAULT_SLOT_LIMIT = 5;

/**
 * Keyed delivery slots for slot control system.
 * `key`       — Firestore-safe identifier used in orders + control docs
 * `label`     — Human-readable label shown in UI
 * `startHour` — 24-hour start time used for buffer-time calculations
 */
export const DELIVERY_SLOT_KEYS = [
    { key: '6-8', label: 'Early Morning (6 – 8 AM)', startHour: 6 },
    { key: '8-10', label: 'Morning (8 – 10 AM)', startHour: 8 },
    { key: '10-12', label: 'Late Morning (10 AM – 12 PM)', startHour: 10 },
    { key: '12-2', label: 'Afternoon (12 – 2 PM)', startHour: 12 },
    { key: '5-7', label: 'Evening (5 – 7 PM)', startHour: 17 },
    { key: '7-8', label: 'Night (7 – 8 PM)', startHour: 19 },
] as const;

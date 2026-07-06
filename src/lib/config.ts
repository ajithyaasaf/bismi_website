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
    estimatedDeliveryTime: 'Fastest Delivery',

    // Currency
    currency: '₹',
    currencyCode: 'INR',
} as const;

/**
 * Delivery zones within ~5 km of the shop.
 * Customers MUST select one of these zones to place a delivery order.
 * The admin uses the zone label + the customer's detailed address to locate the house.
 *
 * To add/remove zones, simply edit this array.
 * `key`   — Unique identifier stored in the order document
 * `label` — Human-readable name shown in the dropdown
 */
export const DELIVERY_ZONES = [
    { key: 'bus-stand', label: 'Near Bus Stand (பேருந்து நிலையம்)' },
    { key: 'sbi-atm', label: 'Near SBI ATM / Hyrnisha Hospital (SBI ATM அருகில்)' },
    { key: 'kamuthi-road', label: 'Kamuthi Road (காமுதி சாலை)' },
    { key: 'paramakudi-road', label: 'Paramakudi Road (பரமக்குடி சாலை)' },
    { key: 'main-bazaar', label: 'Main Bazaar / Market Street (மெயின் பஜார்)' },
    { key: 'mosque-street', label: 'Mosque Street / Pallivasal Street (பள்ளிவாசல் தெரு)' },
    { key: 'north-street', label: 'North Street (வடக்கு தெரு)' },
    { key: 'south-street', label: 'South Street (தெற்கு தெரு)' },
    { key: 'east-street', label: 'East Street (கிழக்கு தெரு)' },
    { key: 'west-street', label: 'West Street (மேற்கு தெரு)' },
    { key: 'keelacheval', label: 'Keelacheval (கீழச்செவல்)' },
    { key: 'melacheval', label: 'Melacheval (மேலச்செவல்)' },
    { key: 'keelaselvanur', label: 'Keelaselvanur (கீழச்செல்வனூர்)' },
    { key: 'melaselvanur', label: 'Melaselvanur (மேலச்செல்வனூர்)' },
    { key: 'other', label: 'Other (மற்றவை)' },
] as const;

/**
 * Maximum delivery radius in kilometers.
 * Used only for display purposes in the "Other" zone warning.
 */
export const DELIVERY_RADIUS_KM = 5;

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
        names: ['Country Chicken (Naatu Kozhi)']
    },
];

/**
 * Meat categories for grouping products on homepage.
 */
export const CATEGORIES = [
    { id: 'chicken', name: 'Chicken', emoji: '🐔', image: '/assets/images/Category images/chicken.avif', description: 'Fresh broiler chicken cuts' },
    { id: 'kadai', name: 'Kaadai', emoji: '🐦', image: '/assets/images/Category images/quail.png', description: 'Fresh kaadai eggs' },
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

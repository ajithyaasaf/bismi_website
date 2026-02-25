/**
 * Seed script — populates Firestore with sample meat types.
 *
 * Usage:
 *   1. Copy your Firebase config to .env.local
 *   2. Run: npx tsx scripts/seed.ts
 *
 * This script is idempotent — it checks for existing documents before creating.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

// Load env manually for scripts
import { config } from 'dotenv';
config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MEAT_TYPES = [
    {
        name: 'Chicken Breast',
        pricePerKg: 280,
        imageURL: '/assets/images/Product images/chicken/Chicken Breasts.png',
        description: 'Boneless chicken breast, tender and lean. Perfect for grilling.',
        category: 'chicken',
        isActive: true,
    },
    {
        name: 'Chicken Curry Cut',
        pricePerKg: 220,
        imageURL: '/assets/images/Product images/chicken/Curry Cuts.png',
        description: 'Fresh chicken cut into curry-sized pieces with bone.',
        category: 'chicken',
        isActive: true,
    },
    {
        name: 'Chicken Leg',
        pricePerKg: 240,
        imageURL: '/assets/images/Product images/chicken/Leg piece.png',
        description: 'Juicy chicken legs, great for roasting and frying.',
        category: 'chicken',
        isActive: true,
    },
    {
        name: 'Chicken Wings',
        pricePerKg: 200,
        imageURL: '/assets/images/Product images/chicken/Chicken Wings.png',
        description: 'Crispy chicken wings, perfect for snacks and appetizers.',
        category: 'chicken',
        isActive: true,
    },
    {
        name: 'Kaadai (Quail)',
        pricePerKg: 550,
        imageURL: '/assets/images/Product images/Quail/quail.webp',
        description: 'Fresh farm raised Kaadai (Quail). Nutrient-rich and delicious.',
        category: 'kadai',
        isActive: true,
    },
    {
        name: 'Beef Curry Cut',
        pricePerKg: 480,
        imageURL: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&q=80',
        description: 'Premium quality beef cut for curries and stews.',
        category: 'beef',
        isActive: true,
    },
    {
        name: 'Beef Mince (Keema)',
        pricePerKg: 520,
        imageURL: 'https://images.unsplash.com/photo-1602473812169-36a0e05d3e2c?w=400&q=80',
        description: 'Freshly minced beef. Ideal for keema, burgers, and rolls.',
        category: 'beef',
        isActive: true,
    },
    {
        name: 'Mutton Curry Cut',
        pricePerKg: 750,
        imageURL: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400&q=80',
        description: 'Tender goat meat with bone, perfect for traditional curries.',
        category: 'mutton',
        isActive: true,
    },
    {
        name: 'Mutton Mince',
        pricePerKg: 800,
        imageURL: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
        description: 'Freshly minced goat meat. Great for keema and samosas.',
        category: 'mutton',
        isActive: true,
    },
    {
        name: 'Fish (Seer/King Fish)',
        pricePerKg: 600,
        imageURL: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
        description: 'Fresh catch seer fish steaks. Excellent for frying and curries.',
        category: 'fish',
        isActive: true,
    },
];

async function seed() {
    console.log('🌱 Starting seed...\n');

    // Check if data already exists
    const existingDocs = await getDocs(collection(db, 'meatTypes'));
    if (existingDocs.size > 0) {
        console.log(`⚠️  Found ${existingDocs.size} existing meat types. Skipping seed.`);
        console.log('   To re-seed, delete the meatTypes collection first.\n');
        process.exit(0);
    }

    for (const meat of MEAT_TYPES) {
        const docRef = await addDoc(collection(db, 'meatTypes'), {
            ...meat,
            updatedAt: serverTimestamp(),
        });
        console.log(`  ✅ ${meat.name} → ${docRef.id}`);
    }

    console.log(`\n🎉 Seeded ${MEAT_TYPES.length} meat types successfully!`);
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});

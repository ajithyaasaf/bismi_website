/**
 * update-products.js  (CommonJS, Firebase Admin SDK)
 * Run with: node -r dotenv/config scripts/update-products.js
 */

'use strict';

require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(process.cwd(), 'scripts', 'serviceAccountKey.json');
let serviceAccount;
try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
} catch (e) {
    console.error('❌ Could not load scripts/serviceAccountKey.json:', e.message);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ─── New products to add ────────────────────────────────────────
const NEW_PRODUCTS = [
    {
        name: 'Chicken Small Curry Cut',
        pricePerKg: 220,
        unit: 'kg',
        imageURL: '/assets/images/Product images/chicken/Chicken curry cut small pieces.png',
        description: 'Small bite-sized chicken pieces with bone. Ideal for quick curries.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
    {
        name: 'Chicken Boneless',
        pricePerKg: 320,
        unit: 'kg',
        imageURL: '/assets/images/Product images/chicken/chicken boneless.png',
        description: 'Fresh boneless chicken cuts. Perfect for grilling, frying, and biryani.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
    {
        name: 'Chicken Lollipop',
        pricePerKg: 280,
        unit: 'kg',
        imageURL: '/assets/images/Product images/chicken/chicken lollipop.png',
        description: 'Shaped chicken lollipops, perfect for frying and appetizers.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
    {
        name: 'Chicken Keema',
        pricePerKg: 260,
        unit: 'kg',
        imageURL: '/assets/images/Product images/chicken/chicken keema.png',
        description: 'Freshly minced chicken. Great for keema curry, cutlets, and rolls.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
];

async function run() {
    console.log('🔧 Starting product update (Admin SDK)...\n');

    const meatRef = db.collection('meatTypes');

    // 1. Update existing "Chicken Curry Cut" image
    console.log('📸 Updating Chicken Curry Cut image to new large image...');
    const currySnap = await meatRef.where('name', '==', 'Chicken Curry Cut').get();
    if (currySnap.empty) {
        console.warn('  ⚠️  "Chicken Curry Cut" not found. Skipping.');
    } else {
        for (const docSnap of currySnap.docs) {
            await docSnap.ref.update({
                imageURL: '/assets/images/Product images/chicken/Curry Cuts.png',
                updatedAt: FieldValue.serverTimestamp(),
            });
            console.log(`  ✅ Updated Chicken Curry Cut → ${docSnap.id}`);
        }
    }

    // 2. Add new products (skip if already exists)
    console.log('\n➕ Adding new products...');
    const allSnap = await meatRef.get();
    const existingNames = new Set(allSnap.docs.map((d) => d.data().name));

    for (const product of NEW_PRODUCTS) {
        if (existingNames.has(product.name)) {
            console.log(`  ⏭️  Skipping "${product.name}" — already exists.`);
            continue;
        }
        const ref = await meatRef.add({
            ...product,
            updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`  ✅ Added "${product.name}" → ${ref.id}`);
    }

    console.log('\n🎉 Done!');
    process.exit(0);
}

run().catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});

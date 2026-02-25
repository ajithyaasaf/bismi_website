/**
 * Script to map real local images to Live Firestore products.
 * Run with: npx tsx scripts/update-local-images.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import {
    getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp, query, where
} from 'firebase/firestore';

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

const IMAGE_MAP: Record<string, string> = {
    'Chicken Breast': '/assets/images/Product images/chicken/Chicken Breasts.png',
    'Chicken Curry Cut': '/assets/images/Product images/chicken/Curry Cuts.png',
    'Chicken Leg': '/assets/images/Product images/chicken/Leg piece.png',
    'Chicken Wings': '/assets/images/Product images/chicken/Chicken Wings.png',
    'Kaadai (Quail)': '/assets/images/Product images/Quail/quail.webp',
};

async function updateImages() {
    console.log('🔧 Updating active products with real local images...');

    const snapshot = await getDocs(query(collection(db, 'meatTypes'), where('isActive', '==', true)));

    let updated = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const newImage = IMAGE_MAP[data.name];

        if (newImage) {
            await updateDoc(doc(db, 'meatTypes', docSnap.id), {
                imageURL: newImage,
                updatedAt: serverTimestamp(),
            });
            console.log(`  ✅ Updated: ${data.name} -> ${newImage}`);
            updated++;
        }
    }

    console.log(`\n🎉 Done! Updated ${updated} products.`);
    process.exit(0);
}

updateImages().catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
});

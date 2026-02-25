/**
 * One-off script to rename the 'Country Chicken' product to 'Kaadai'
 * Run with: npx tsx scripts/rename-kaadai.ts
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

async function renameKaadai() {
    console.log('🔧 Changing product name from "Country Chicken" to "Kaadai"...');

    const q = query(collection(db, 'meatTypes'), where('category', '==', 'kadai'));
    const snapshot = await getDocs(q);

    let updated = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        await updateDoc(doc(db, 'meatTypes', docSnap.id), {
            name: 'Kaadai (Quail)',
            description: 'Fresh farm raised Kaadai (Quail). Nutrient-rich and delicious.',
            updatedAt: serverTimestamp(),
        });
        console.log(`  ✅ Updated: ${docSnap.id}`);
        updated++;
    }

    console.log(`\n🎉 Done! Updated ${updated} products.`);
    process.exit(0);
}

renameKaadai().catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
});

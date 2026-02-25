/**
 * Deactivate beef, mutton, and fish products in Firestore.
 * Run with: npx tsx scripts/deactivate-products.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import {
    getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const INACTIVE_CATEGORIES = ['beef', 'mutton', 'fish'];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deactivate() {
    console.log('🔧 Deactivating beef, mutton, and fish products...\n');

    const snapshot = await getDocs(collection(db, 'meatTypes'));
    let deactivated = 0;
    let skipped = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (INACTIVE_CATEGORIES.includes(data.category)) {
            await updateDoc(doc(db, 'meatTypes', docSnap.id), {
                isActive: false,
                updatedAt: serverTimestamp(),
            });
            console.log(`  ✅ Deactivated: ${data.name} (${data.category})`);
            deactivated++;
        } else {
            console.log(`  ⏭️  Kept active: ${data.name} (${data.category})`);
            skipped++;
        }
    }

    console.log(`\n🎉 Done! Deactivated: ${deactivated}, Kept active: ${skipped}`);
    process.exit(0);
}

deactivate().catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
});

/**
 * Migrate all meatTypes to include the 'unit' field.
 * - Chicken products → unit: 'kg'
 * - Kaadai (Quail)  → unit: 'piece', pricePerPiece: 120
 *
 * Run with: npx tsx scripts/migrate-units.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

async function migrateUnits() {
    console.log('🔧 Migrating meatTypes to include unit field...\n');

    const snapshot = await getDocs(collection(db, 'meatTypes'));

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (data.category === 'kadai') {
            // Quail → piece-based; ₹120/piece is a placeholder — update via your admin or script later
            await updateDoc(doc(db, 'meatTypes', docSnap.id), {
                unit: 'piece',
                pricePerPiece: 120,
                updatedAt: serverTimestamp(),
            });
            console.log(`  🐦 Kaadai → unit: piece, pricePerPiece: ₹120`);
        } else {
            // All chicken products → kg-based
            await updateDoc(doc(db, 'meatTypes', docSnap.id), {
                unit: 'kg',
                updatedAt: serverTimestamp(),
            });
            console.log(`  🍗 ${data.name} → unit: kg`);
        }
    }

    console.log('\n✅ Migration complete!');
    process.exit(0);
}

migrateUnits().catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
});

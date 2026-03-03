import { config } from 'dotenv';
config({ path: '.env.local' });
import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { db } from './src/lib/firebase';

async function fixSpelling() {
    console.log('Searching for "Nattu" in Firestore...');
    const q = query(collection(db, 'meatTypes'));
    const snapshot = await getDocs(q);

    for (const productDoc of snapshot.docs) {
        const data = productDoc.data();
        const name = data.name || '';
        if (name.includes('Nattu')) {
            const newName = name.replace(/Nattu/g, 'Naatu');
            console.log(`Updating "${name}" to "${newName}"...`);
            await updateDoc(doc(db, 'meatTypes', productDoc.id), { name: newName });
        }
    }
    console.log('Spelling fix complete.');
}

fixSpelling().catch(console.error);

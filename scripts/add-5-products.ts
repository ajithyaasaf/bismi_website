import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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
const auth = getAuth(app);

const NEW_PRODUCTS = [
    {
        name: 'Chicken Gravy Cut',
        pricePerKg: 240,
        unit: 'kg',
        imageURL: '/assets/images/Product images/chicken/Gravy cut.webp',
        description: 'Perfectly cut chicken pieces optimized for rich gravies and curries.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
    {
        name: 'Chicken Biriyani Cut',
        pricePerKg: 240,
        unit: 'kg',
        imageURL: '/assets/images/Product images/chicken/Briyani cut.webp',
        description: 'Large, succulent chicken pieces specially cut for authentic biryani.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
    {
        name: 'Country Chicken (Nattu Kozhi)',
        pricePerKg: 350,
        unit: 'kg',
        imageURL: '/assets/images/Product images/chicken/country chicken.png',
        description: 'Healthy and natural country chicken (Nattu Kozhi) for traditional recipes.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
    {
        name: 'White Egg',
        pricePerKg: 0,
        pricePerPiece: 6,
        unit: 'piece',
        imageURL: '/assets/images/Product images/chicken/white egg.png',
        description: 'Farm-fresh white eggs, rich in protein. Sold per piece.',
        category: 'chicken',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    },
    {
        name: 'Quail Egg',
        pricePerKg: 0,
        pricePerPiece: 4,
        unit: 'piece',
        imageURL: '/assets/images/Product images/chicken/quail egg.png',
        description: 'Nutritious fresh quail eggs. Sold per piece.',
        category: 'kadai',
        isActive: true,
        todayAvailable: false,
        todayLabel: '',
    }
];

async function run() {
    console.log('🔧 Starting product addition for 5 new items...');
    const ADMIN_EMAIL = 'admin@example.com';
    const ADMIN_PASSWORD = 'password';
    try {
        console.log(`🔐 Authenticating as ${ADMIN_EMAIL}...`);
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Authenticated successfully.');
    } catch (e: any) {
        console.error('❌ Authentication failed.', e.message);
        process.exit(1);
    }

    const meatRef = collection(db, 'meatTypes');
    console.log('\n➕ Adding new products...');

    // Get existing to prevent duplicates
    const allSnap = await getDocs(meatRef);
    const existingNames = new Set(allSnap.docs.map((d) => d.data().name as string));

    for (const product of NEW_PRODUCTS) {
        if (existingNames.has(product.name)) {
            console.log(`  ⏭️  Skipping "${product.name}" — already exists.`);
            continue;
        }

        // Remove undefined/0 price fields based on unit to keep DB clean
        const dataToSave = { ...product };
        if (dataToSave.unit === 'piece') {
            delete (dataToSave as any).pricePerKg;
        } else {
            delete (dataToSave as any).pricePerPiece;
        }

        const ref = await addDoc(meatRef, {
            ...dataToSave,
            updatedAt: serverTimestamp(),
        });
        console.log(`  ✅ Added "${product.name}" → ${ref.id}`);
    }

    console.log('\n🎉 Done! All 5 products processed.');
    process.exit(0);
}

run().catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});

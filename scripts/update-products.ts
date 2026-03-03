import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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
    console.log('🔧 Starting product update (Web SDK + Auth)...');

    // To bypass rules securely without an Admin SDK or CLI deploy, we authenticate
    // Please enter your admin credentials here momentarily to run the script.
    const ADMIN_EMAIL = 'admin@bismibroilers.com'; // CHANGE THIS TO YOUR ADMIN EMAIL
    const ADMIN_PASSWORD = 'password123';        // CHANGE THIS TO YOUR ADMIN PASSWORD

    try {
        console.log(`🔐 Authenticating as ${ADMIN_EMAIL}...`);
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Authenticated successfully.');
    } catch (e: any) {
        console.error('❌ Authentication failed. Please update ADMIN_EMAIL and ADMIN_PASSWORD in the script.', e.message);
        process.exit(1);
    }

    const meatRef = collection(db, 'meatTypes');

    console.log('\n📸 Updating Chicken Curry Cut image...');
    const currySnap = await getDocs(query(meatRef, where('name', '==', 'Chicken Curry Cut')));
    if (currySnap.empty) {
        console.warn('  ⚠️  "Chicken Curry Cut" not found.');
    } else {
        for (const docSnap of currySnap.docs) {
            await updateDoc(docSnap.ref, {
                imageURL: '/assets/images/Product images/chicken/Curry Cuts.png',
                updatedAt: serverTimestamp(),
            });
            console.log(`  ✅ Updated Chicken Curry Cut → ${docSnap.id}`);
        }
    }

    console.log('\n➕ Adding new products...');
    const allSnap = await getDocs(meatRef);
    const existingNames = new Set(allSnap.docs.map((d) => d.data().name as string));

    for (const product of NEW_PRODUCTS) {
        if (existingNames.has(product.name)) {
            console.log(`  ⏭️  Skipping "${product.name}" — already exists.`);
            continue;
        }
        const ref = await addDoc(meatRef, {
            ...product,
            updatedAt: serverTimestamp(),
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

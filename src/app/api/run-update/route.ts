import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import path from 'path';

export async function GET() {
    console.log('API Route: Starting product update...');

    // 1. Initialize Admin SDK if not already initialized
    if (!admin.apps.length) {
        try {
            const serviceAccountPath = path.join(process.cwd(), 'scripts', 'serviceAccountKey.json');
            const raw = fs.readFileSync(serviceAccountPath, 'utf8');
            const serviceAccount = JSON.parse(raw);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('API Route: Firebase Admin Initialized');
        } catch (e: any) {
            console.error('API Route: Failed to init admin', e);
            return NextResponse.json({ error: 'Failed to init admin', details: e.message }, { status: 500 });
        }
    }

    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;

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

    try {
        const meatRef = db.collection('meatTypes');
        const results: string[] = [];

        // Update Chicken Curry Cut
        const currySnap = await meatRef.where('name', '==', 'Chicken Curry Cut').get();
        if (!currySnap.empty) {
            for (const docSnap of currySnap.docs) {
                await docSnap.ref.update({
                    imageURL: '/assets/images/Product images/chicken/Curry Cuts.png',
                    updatedAt: FieldValue.serverTimestamp(),
                });
                results.push(`Updated Chicken Curry Cut -> ${docSnap.id}`);
            }
        }

        // Add new products
        const allSnap = await meatRef.get();
        const existingNames = new Set(allSnap.docs.map((d) => d.data().name));

        for (const product of NEW_PRODUCTS) {
            if (existingNames.has(product.name)) {
                results.push(`Skipped ${product.name} (exists)`);
                continue;
            }
            const ref = await meatRef.add({
                ...product,
                updatedAt: FieldValue.serverTimestamp(),
            });
            results.push(`Added ${product.name} -> ${ref.id}`);
        }

        return NextResponse.json({ success: true, results });
    } catch (e: any) {
        console.error('API Route Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

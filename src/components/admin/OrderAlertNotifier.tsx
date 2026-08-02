'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { playOrderNotificationChime } from '@/lib/audioNotification';

const SOUND_PREF_KEY = 'bismi_admin_sound_enabled';

export default function OrderAlertNotifier() {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
    const [audioAllowed, setAudioAllowed] = useState(true);

    // Keep track of order IDs seen so far to prevent initial snapshot false alarms
    const knownOrderIds = useRef<Set<string>>(new Set());
    const isFirstRun = useRef(true);

    // Load sound preference
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SOUND_PREF_KEY);
            if (saved !== null) {
                setSoundEnabled(JSON.parse(saved));
            }
        } catch {
            /* silent fallback */
        }
    }, []);

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        try {
            localStorage.setItem(SOUND_PREF_KEY, JSON.stringify(next));
        } catch {
            /* silent fallback */
        }
        if (next) {
            playOrderNotificationChime();
        }
    };

    const enableAudioContext = () => {
        setAudioAllowed(true);
        playOrderNotificationChime();
    };

    // Real-time Firestore Listener for Pending Orders
    useEffect(() => {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('status', '==', 'pending'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const currentPending: Order[] = [];
                const newlyArrived: Order[] = [];

                snapshot.docs.forEach((docSnap) => {
                    const data = { id: docSnap.id, ...docSnap.data() } as Order;
                    currentPending.push(data);

                    if (!isFirstRun.current && !knownOrderIds.current.has(docSnap.id)) {
                        newlyArrived.push(data);
                    }
                });

                // Update known order IDs set
                currentPending.forEach((o) => knownOrderIds.current.add(o.id));

                if (isFirstRun.current) {
                    isFirstRun.current = false;
                    return;
                }

                // If new order arrived!
                if (newlyArrived.length > 0) {
                    const latest = newlyArrived[0];
                    setNewOrderAlert(latest);

                    if (soundEnabled) {
                        try {
                            playOrderNotificationChime();
                        } catch {
                            setAudioAllowed(false);
                        }
                    }
                }
            },
            (error) => {
                console.error('Real-time order listener error:', error);
            }
        );

        return () => unsubscribe();
    }, [soundEnabled]);

    return (
        <>
            {/* Top Sound Control Bar / Banner */}
            <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
                {!audioAllowed && (
                    <button
                        onClick={enableAudioContext}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 animate-bounce flex items-center gap-1.5 transition-all"
                    >
                        <span>🔊</span> Tap to Enable Sound Alerts
                    </button>
                )}

                <button
                    onClick={toggleSound}
                    title={soundEnabled ? 'Order Sound Enabled' : 'Order Sound Muted'}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-md border transition-all flex items-center gap-1.5 ${
                        soundEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                    }`}
                >
                    <span>{soundEnabled ? '🔔' : '🔕'}</span>
                    <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
                </button>
            </div>

            {/* Floating New Order Alert Toast */}
            {newOrderAlert && (
                <div className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-red-600 text-white rounded-2xl p-4 shadow-2xl border-2 border-white/20 animate-slide-in">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl animate-pulse">🚨</span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-red-200">
                                    New Order Received!
                                </p>
                                <h4 className="text-base font-bold truncate">{newOrderAlert.customerName}</h4>
                            </div>
                        </div>
                        <button
                            onClick={() => setNewOrderAlert(null)}
                            className="text-white/80 hover:text-white text-sm font-bold bg-white/10 hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                        <div>
                            <p className="font-semibold text-white/90">
                                +91 {newOrderAlert.mobile} · {newOrderAlert.items.length} items
                            </p>
                            <p className="font-bold text-yellow-300 text-sm mt-0.5">
                                {formatCurrency(newOrderAlert.totalAmount)} ({newOrderAlert.deliveryType})
                            </p>
                        </div>

                        <Link
                            href={`/admin/orders/${newOrderAlert.id}`}
                            onClick={() => setNewOrderAlert(null)}
                            className="px-3.5 py-2 text-xs font-bold text-red-700 bg-white hover:bg-red-50 rounded-xl transition-all shadow-sm shrink-0"
                        >
                            View Order →
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

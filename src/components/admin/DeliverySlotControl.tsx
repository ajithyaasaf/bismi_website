'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    fetchDailySlotControl,
    saveDailySlotControl,
    getOrderCountsForAllSlots,
    getTodayDateString,
} from '@/lib/slotControl';
import { DELIVERY_SLOT_KEYS, DEFAULT_SLOT_LIMIT } from '@/lib/config';
import type { DailySlotControl as SlotControlData, SlotKey } from '@/types';

export default function DeliverySlotControl() {
    const [control, setControl] = useState<SlotControlData | null>(null);
    const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const dateRef = useRef(getTodayDateString());

    // ─── Fetch Data ───────────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            setError('');
            const date = dateRef.current;
            const [ctrl, counts] = await Promise.all([
                fetchDailySlotControl(date),
                getOrderCountsForAllSlots(date),
            ]);
            setControl(ctrl);
            setOrderCounts(counts);
        } catch (err) {
            console.error('[DeliverySlotControl] loadData failed:', err);
            setError('Failed to load slot data. Please refresh.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        // Auto-refresh every 30 seconds for live order counts
        const interval = setInterval(loadData, 30_000);
        return () => clearInterval(interval);
    }, [loadData]);

    // ─── Persist Changes ──────────────────────────────────
    const persistControl = useCallback(async (updated: SlotControlData) => {
        setSaving(true);
        setError('');
        try {
            await saveDailySlotControl(dateRef.current, updated);
        } catch (err) {
            console.error('[DeliverySlotControl] save failed:', err);
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    }, []);

    // ─── Handlers ─────────────────────────────────────────
    const toggleShopClosed = useCallback(() => {
        if (!control) return;
        const updated = { ...control, shopClosed: !control.shopClosed };
        setControl(updated);
        persistControl(updated);
    }, [control, persistControl]);

    const toggleSlotEnabled = useCallback((key: SlotKey) => {
        if (!control) return;
        const slot = control.slots[key];
        const updated: SlotControlData = {
            ...control,
            slots: {
                ...control.slots,
                [key]: { ...slot, enabled: !slot.enabled },
            },
        };
        setControl(updated);
        persistControl(updated);
    }, [control, persistControl]);

    // Debounce timer ref for maxOrders input
    const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const handleMaxOrdersChange = useCallback((key: SlotKey, value: string) => {
        if (!control) return;
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) return;

        const updated: SlotControlData = {
            ...control,
            slots: {
                ...control.slots,
                [key]: { ...control.slots[key], maxOrders: num },
            },
        };
        setControl(updated);

        // Debounce the Firestore write by 600ms
        if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
        debounceTimers.current[key] = setTimeout(() => {
            persistControl(updated);
        }, 600);
    }, [control, persistControl]);

    // ─── Render ───────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Today&apos;s Delivery Control</h2>
                <div className="flex items-center justify-center py-8">
                    <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Loading slot data…</span>
                </div>
            </div>
        );
    }

    if (!control) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Today&apos;s Delivery Control</h2>
                <p className="text-sm text-red-600">Unable to load slot control data.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-sm font-bold text-gray-900">Today&apos;s Delivery Control</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{dateRef.current}</p>
                </div>
                <div className="flex items-center gap-2">
                    {saving && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                            Saving…
                        </span>
                    )}
                    <button
                        onClick={loadData}
                        className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            )}

            {/* Shop Open / Closed Toggle */}
            <div className="flex items-center justify-between p-4 mb-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                    <p className="text-sm font-semibold text-gray-900">Shop Open Today</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {control.shopClosed
                            ? 'All delivery slots are hidden for customers'
                            : 'Customers can see available slots'}
                    </p>
                </div>
                <button
                    onClick={toggleShopClosed}
                    role="switch"
                    aria-checked={!control.shopClosed}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!control.shopClosed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!control.shopClosed ? 'translate-x-5' : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Shop Closed Warning */}
            {control.shopClosed && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <span className="text-base">⚠️</span>
                    <p className="text-xs text-amber-700">
                        Shop is marked as closed. Customers will see &quot;Shop closed today&quot;
                        and be shown tomorrow&apos;s slots instead.
                    </p>
                </div>
            )}

            {/* Slot List */}
            <div className="space-y-3">
                {DELIVERY_SLOT_KEYS.map((slotDef) => {
                    const key = slotDef.key as SlotKey;
                    const slotConfig = control.slots[key] ?? { enabled: true, maxOrders: DEFAULT_SLOT_LIMIT };
                    const count = orderCounts[key] ?? 0;
                    const isFull = count >= slotConfig.maxOrders;

                    return (
                        <div
                            key={key}
                            className={`p-4 rounded-xl border transition-colors ${!slotConfig.enabled
                                    ? 'bg-gray-50 border-gray-200 opacity-60'
                                    : isFull
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-white border-gray-100'
                                }`}
                        >
                            {/* Slot Header Row */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-semibold text-gray-900 truncate">
                                        {slotDef.label}
                                    </span>
                                    {isFull && slotConfig.enabled && (
                                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full uppercase">
                                            Full
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => toggleSlotEnabled(key)}
                                    role="switch"
                                    aria-checked={slotConfig.enabled}
                                    className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${slotConfig.enabled ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${slotConfig.enabled ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Slot Details Row */}
                            <div className="flex items-center justify-between gap-4">
                                {/* Order Count */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Orders:</span>
                                    <span
                                        className={`text-sm font-bold ${isFull ? 'text-red-600' : 'text-gray-900'
                                            }`}
                                    >
                                        {count} / {slotConfig.maxOrders}
                                    </span>
                                </div>

                                {/* Max Orders Input */}
                                <div className="flex items-center gap-2">
                                    <label
                                        htmlFor={`max-${key}`}
                                        className="text-xs text-gray-500 whitespace-nowrap"
                                    >
                                        Max:
                                    </label>
                                    <input
                                        id={`max-${key}`}
                                        type="number"
                                        min={0}
                                        max={99}
                                        value={slotConfig.maxOrders}
                                        onChange={(e) => handleMaxOrdersChange(key, e.target.value)}
                                        className="w-16 px-2 py-1.5 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Buffer Time Info (fixed, not editable) */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                <span className="text-sm">ℹ️</span>
                <p className="text-xs text-blue-700">
                    Buffer time is set to <strong>60 minutes</strong>. Slots are automatically hidden
                    for customers 60 minutes before start time.
                </p>
            </div>
        </div>
    );
}

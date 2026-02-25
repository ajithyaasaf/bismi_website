'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CartItem } from '@/types';

// ─── State & Actions ─────────────────────────────────────
interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'UPDATE_QUANTITY'; payload: { meatTypeId: string; kg?: number; pieces?: number } }
    | { type: 'REMOVE_ITEM'; payload: { meatTypeId: string } }
    | { type: 'CLEAR_CART' }
    | { type: 'HYDRATE'; payload: CartItem[] };

interface CartContextValue {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (item: CartItem) => void;
    updateQuantity: (meatTypeId: string, qty: number) => void;
    removeItem: (meatTypeId: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Helper: subtotal for a single item ──────────────────
function itemSubtotal(item: CartItem): number {
    if (item.unit === 'piece') {
        return (item.pieces ?? 0) * (item.pricePerPiece ?? 0);
    }
    return (item.kg ?? 0) * (item.pricePerKg ?? 0);
}

// ─── Reducer ─────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                (item) => item.meatTypeId === action.payload.meatTypeId
            );
            if (existingIndex >= 0) {
                // Accumulate quantity when already in cart
                const updated = [...state.items];
                const existing = updated[existingIndex];
                updated[existingIndex] = {
                    ...existing,
                    kg: existing.unit === 'kg'
                        ? (existing.kg ?? 0) + (action.payload.kg ?? 0)
                        : existing.kg,
                    pieces: existing.unit === 'piece'
                        ? (existing.pieces ?? 0) + (action.payload.pieces ?? 0)
                        : existing.pieces,
                };
                return { items: updated };
            }
            return { items: [...state.items, action.payload] };
        }

        case 'UPDATE_QUANTITY': {
            return {
                items: state.items.map((item) => {
                    if (item.meatTypeId !== action.payload.meatTypeId) return item;
                    return item.unit === 'piece'
                        ? { ...item, pieces: action.payload.pieces }
                        : { ...item, kg: action.payload.kg };
                }),
            };
        }

        case 'REMOVE_ITEM': {
            return {
                items: state.items.filter((item) => item.meatTypeId !== action.payload.meatTypeId),
            };
        }

        case 'CLEAR_CART':
            return { items: [] };

        case 'HYDRATE':
            return { items: action.payload };

        default:
            return state;
    }
}

// ─── Persistence ─────────────────────────────────────────
const CART_STORAGE_KEY = 'bismi-cart';

function saveCart(items: CartItem[]): void {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); } catch { /* silent */ }
}

function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* silent */ }
    return [];
}

// ─── Provider ────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    useEffect(() => {
        const saved = loadCart();
        if (saved.length > 0) dispatch({ type: 'HYDRATE', payload: saved });
    }, []);

    useEffect(() => { saveCart(state.items); }, [state.items]);

    const addItem = useCallback((item: CartItem) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    }, []);

    const updateQuantity = useCallback((meatTypeId: string, qty: number) => {
        const item = state.items.find(i => i.meatTypeId === meatTypeId);
        if (!item) return;
        dispatch({
            type: 'UPDATE_QUANTITY',
            payload: item.unit === 'piece'
                ? { meatTypeId, pieces: qty }
                : { meatTypeId, kg: qty },
        });
    }, [state.items]);

    const removeItem = useCallback((meatTypeId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { meatTypeId } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const subtotal = state.items.reduce((sum, item) => sum + itemSubtotal(item), 0);
    const itemCount = state.items.length;

    return (
        <CartContext.Provider
            value={{ items: state.items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────
export function useCart(): CartContextValue {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}

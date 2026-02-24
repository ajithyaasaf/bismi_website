'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CartItem } from '@/types';

// ─── State & Actions ─────────────────────────────────────
interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'UPDATE_QUANTITY'; payload: { meatTypeId: string; kg: number } }
    | { type: 'REMOVE_ITEM'; payload: { meatTypeId: string } }
    | { type: 'CLEAR_CART' }
    | { type: 'HYDRATE'; payload: CartItem[] };

interface CartContextValue {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (item: CartItem) => void;
    updateQuantity: (meatTypeId: string, kg: number) => void;
    removeItem: (meatTypeId: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Reducer ─────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                (item) => item.meatTypeId === action.payload.meatTypeId
            );
            if (existingIndex >= 0) {
                // Update quantity if already in cart
                const updated = [...state.items];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    kg: updated[existingIndex].kg + action.payload.kg,
                };
                return { items: updated };
            }
            return { items: [...state.items, action.payload] };
        }

        case 'UPDATE_QUANTITY': {
            return {
                items: state.items.map((item) =>
                    item.meatTypeId === action.payload.meatTypeId
                        ? { ...item, kg: action.payload.kg }
                        : item
                ),
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
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Storage full or unavailable — fail silently
    }
}

function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // Corrupted data — fail silently
    }
    return [];
}

// ─── Provider ────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    // Hydrate from localStorage on mount
    useEffect(() => {
        const saved = loadCart();
        if (saved.length > 0) {
            dispatch({ type: 'HYDRATE', payload: saved });
        }
    }, []);

    // Persist to localStorage on every change
    useEffect(() => {
        saveCart(state.items);
    }, [state.items]);

    const addItem = useCallback((item: CartItem) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    }, []);

    const updateQuantity = useCallback((meatTypeId: string, kg: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { meatTypeId, kg } });
    }, []);

    const removeItem = useCallback((meatTypeId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { meatTypeId } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const subtotal = state.items.reduce((sum, item) => sum + item.kg * item.pricePerKg, 0);
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
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

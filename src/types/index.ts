import { Timestamp } from 'firebase/firestore';

// ─── Enums ───────────────────────────────────────────────
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum DeliveryType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

// ─── Firestore Document Types ────────────────────────────
export interface MeatType {
  id: string;
  name: string;
  pricePerKg: number;       // For kg-based products
  pricePerPiece?: number;   // For piece-based products (e.g. Quail)
  unit: 'kg' | 'piece';    // Determines which UI/model to use
  imageURL: string;
  description: string;
  category: string;
  isActive: boolean;
  updatedAt: Timestamp;
}

export interface OrderItem {
  meatTypeId: string;
  meatName: string;
  unit: 'kg' | 'piece';
  // Exactly one of these will be set, depending on unit type:
  kg?: number;
  pieces?: number;
  // Price locked at time of order:
  pricePerKg?: number;
  pricePerPiece?: number;
  // Optional cutting preference (used for quail):
  cuttingPreference?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  mobile: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  deliveryType: DeliveryType;
  address: string;
  status: OrderStatus;
  idempotencyToken: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Cart Types (Client-side) ────────────────────────────
export interface CartItem {
  meatTypeId: string;
  meatName: string;
  unit: 'kg' | 'piece';
  // One of these will be set:
  kg?: number;
  pieces?: number;
  // One of these will be set:
  pricePerKg?: number;
  pricePerPiece?: number;
  // Optional cutting preference (for quail):
  cuttingPreference?: string;
  imageURL: string;
}

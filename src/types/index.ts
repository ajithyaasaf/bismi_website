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
  pricePerKg: number;
  imageURL: string;
  description: string;
  category: string;
  isActive: boolean;
  updatedAt: Timestamp;
}

export interface OrderItem {
  meatTypeId: string;
  meatName: string;
  kg: number;
  pricePerKg: number; // Locked at order time
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
  kg: number;
  pricePerKg: number; // Locked when added to cart
  imageURL: string;
}

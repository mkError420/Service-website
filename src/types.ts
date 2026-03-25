import { Timestamp } from 'firebase/firestore';

export type UserRole = 'client' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'MERN Stack' | 'WordPress' | 'Video Editing' | 'Digital Marketing';
  image?: string;
  features?: string[];
  active: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  serviceId: string;
  serviceTitle: string;
  price: number;
  status: 'pending' | 'paid' | 'in-progress' | 'completed' | 'cancelled';
  paymentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Review {
  id: string;
  serviceId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment?: string;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  orderId?: string;
  createdAt: Timestamp;
}

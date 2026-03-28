import { Timestamp } from 'firebase/firestore';

export type UserRole = 'client' | 'admin' | 'employee';

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
  expertId?: string; // Default expert for this service
  expertName?: string;
}

export interface Order {
  id: string;
  clientId: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  projectDetails?: string;
  serviceId: string;
  serviceTitle: string;
  price: number;
  status: 'pending' | 'paid' | 'in-progress' | 'completed' | 'cancelled';
  cancellationNote?: string;
  paymentId?: string;
  assignedExpertId?: string; // Employee/Expert UID
  assignedExpertName?: string; // Employee/Expert Name
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

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
  status: 'new' | 'read' | 'replied';
}

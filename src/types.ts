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

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  count?: string;
  createdAt: Timestamp;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  features?: string[];
  active: boolean;
  expertId?: string; // Default expert for this service
  expertName?: string;
  rating?: number;
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
  uid?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
  status: 'new' | 'read' | 'replied';
  replyContent?: string;
  repliedAt?: Timestamp;
}

export interface Settings {
  platformName: string;
  supportEmail: string;
  supportPhone?: string;
  officeAddress?: string;
  workingHours?: string;
  maintenanceMode: boolean;
  showreelUrl?: string;
  updatedAt?: Timestamp;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  rating: number;
  featured: boolean;
  createdAt: Timestamp;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  specialties: string[];
  socials: {
    linkedin?: string;
    twitter?: string;
  };
  active: boolean;
  createdAt: Timestamp;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  createdAt: Timestamp;
}

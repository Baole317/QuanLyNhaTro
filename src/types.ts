export type UserRole = 'landlord' | 'tenant';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  roomNumber?: string;
  displayName: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  basePrice: number;
  tenantId?: string;
  tenantName?: string;
  electricityPrice: number;
  waterPrice: number;
  servicePrice: number;
  lastElectricityReading: number;
  lastWaterReading: number;
}

export interface Bill {
  id: string;
  roomId: string;
  roomNumber: string;
  month: string; // YYYY-MM
  electricity: {
    oldReading: number;
    newReading: number;
    usage: number;
    price: number;
    total: number;
  };
  water: {
    oldReading: number;
    newReading: number;
    usage: number;
    price: number;
    total: number;
  };
  basePrice: number;
  servicePrice: number;
  totalAmount: number;
  status: 'unpaid' | 'paid';
  createdAt: any;
}

export interface Issue {
  id: string;
  roomId: string;
  roomNumber: string;
  tenantId: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed';
  landlordNote?: string;
  createdAt: any;
}

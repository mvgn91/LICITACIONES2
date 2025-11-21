import type { Timestamp } from 'firebase/firestore';

export interface Contract {
  id: string;
  clientName: string;
  address: string;
  phone: string;
  contractDate: Timestamp;
  totalAmount: number;
  progress: number; 
  estimations: Estimation[];
}

export interface Estimation {
  id: string;
  description: string;
  amount: number;
  isCompleted: boolean;
  evidencias: string[]; // URLs to files in Firebase Storage
}

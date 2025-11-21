
import type { Timestamp } from 'firebase/firestore';

export interface Contrato {
  id: string; // Firestore document ID
  nombre: string;
  cliente: string;
  montoBase: number;
  montoSinIVA: number;
  montoConIVA: number;
  anticipoMonto?: number;
  anticipoFecha?: Timestamp;
  descripcion: string;
  fechaInicio: Timestamp;
  fechaTerminoEstimada: Timestamp;
  observacionesGenerales?: string;
  estado: 'Activo' | 'Cerrado';
  docConstructoraOK: boolean;
  docConstructoraObs?: string;
  docControlOK: boolean;
  docControlObs?: string;
  cierreObservaciones?: string;
  createdAt: Timestamp;
}

export interface Estimacion {
  id: string; // Firestore document ID
  tipo: 'Parcial' | 'Total';
  monto: number;
  observaciones?: string;
  ordenCompraUrl?: string;
  createdAt: Timestamp;
  evidencias?: string[];
  isCompleted: boolean;
}

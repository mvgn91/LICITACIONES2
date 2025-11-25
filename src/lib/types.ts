
export type Estado = 'Activo' | 'Cerrado' | 'Terminado';

export interface Contrato {
  id: string;
  nombre: string;
  cliente: string;
  montoConIVA: number;
  montoSinIVA: number;
  montoBase: number;
  fechaInicio: number;
  fechaTerminoEstimada: number;
  estado: Estado;
  userId: string;
  createdAt: number;

  // Fases y Aprobaciones
  faseConstructoraAprobada?: boolean;
  faseControlPresupuestalAprobada?: boolean;
  faseConstructoraEvidencia?: string[]; // Rutas a archivos
  faseControlPresupuestalEvidencia?: string[]; // Rutas a archivos

  // Pagos y Estimaciones
  estimaciones?: Estimacion[];
  anticipoMonto?: number;
  anticipoFecha?: number;
  anticipoEvidencia?: string[];
}

export interface Estimacion {
    id: string;
    tipo: 'Parcial' | 'Liquidación';
    monto: number;
    observaciones?: string;
    createdAt: number;
    evidencias?: string[]; // Rutas a archivos de evidencia
    ordenCompraUrl?: string;
    ocRecibida?: boolean;
}

export interface Transaction {
    id: string;
    type: 'Anticipo' | 'Estimación';
    description: string;
    date: number;
    amount: number;
    evidence?: string[];
    ordenCompraUrl?: string;
    ocRecibida?: boolean;
}

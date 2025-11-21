export interface Contrato {
  id: string;
  nombre: string;
  cliente: string;
  montoBase: number;
  montoSinIVA: number;
  montoConIVA: number;
  anticipoMonto?: number;
  anticipoFecha?: number; // timestamp
  descripcion: string;
  fechaInicio: number; // timestamp
  fechaTerminoEstimada: number; // timestamp
  observacionesGenerales?: string;
  estado: 'Activo' | 'Cerrado';
  docConstructoraOK?: boolean;
  docConstructoraObs?: string;
  docControlOK?: boolean;
  docControlObs?: string;
  cierreObservaciones?: string;
  createdAt: number; // timestamp
  userId: string;
}

export interface Estimacion {
  id: string;
  tipo: 'Parcial' | 'Total';
  monto: number;
  observaciones?: string;
  ordenCompraUrl?: string;
  createdAt: number; // timestamp
  evidencias?: string[];
  isCompleted: boolean;
}

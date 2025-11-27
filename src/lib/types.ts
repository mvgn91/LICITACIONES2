
// --- Tipos Base ---
export type ContratoId = number;
export type EstimacionId = number;

// --- Nueva Arquitectura para Flujo de Aprobación ---

// El estado de un documento individual en el flujo de aprobación.
export type DocumentoStatus = 'Pendiente' | 'Cargado' | 'Aprobado' | 'Rechazado';

// Representa un único documento requerido en una fase.
export interface Documento {
  id: string; // Identificador único del documento, ej: "doc_acta_constitutiva"
  nombre: string; // Nombre legible para el usuario, ej: "Acta Constitutiva"
  estado: DocumentoStatus;
  url?: string; // URL al archivo, si existe
  fechaCarga?: string;
  fechaAprobacion?: string;
}

// Representa una fase del proceso de aprobación, que contiene múltiples documentos.
export interface Fase {
  id: string; // Identificador único de la fase, ej: "fase_1_constructora"
  nombre: string; // Nombre legible, ej: "Fase 1: Revisión Constructora"
  documentos: Documento[];
  estaAprobada: boolean; // Se calcula si todos los documentos de la fase están aprobados.
}

// --- Tipos Principales de la Aplicación ---

// Representa una estimación o pago asociado a un contrato.
export interface Estimacion {
  id: EstimacionId;
  contratoId: ContratoId;
  numero: string;
  tipo: 'Parcial' | 'Liquidación';
  descripcion: string;
  monto: number; 
  fecha: string;
  estado: 'Pendiente' | 'Aprobada' | 'Pagada';
  evidencia?: string; 
}

// El objeto principal que representa un contrato.
export interface Contrato {
  id: ContratoId;
  nombre: string;
  cliente: string;
  numeroContrato: string;
  objeto: string;
  localizacion: string;
  montoBase: number; 
  montoConIVA: number; 
  fechaInicio?: string; // <-- CORREGIDO: La fecha puede ser opcional.
  fechaTerminoEstimada?: string; // <-- CORREGIDO: La fecha puede ser opcional.
  anticipoMonto?: number; 
  anticipoFecha?: string;
  anticipoEvidencia?: string;
  estado: string; // Ej: "Activo", "Completado", "En Pausa"
  fechaFinalizacionReal?: string;

  // --- Campos Obsoletos ---
  faseConstructoraAprobada?: boolean;
  faseControlPresupuestalAprobada?: boolean;

  // --- La Nueva Estructura --- 
  fases?: Fase[]; 
}

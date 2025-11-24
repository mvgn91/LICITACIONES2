
import type { Contrato, Estimacion } from './types';

// Estimaciones para Contrato 1
export const mockEstimacionesContrato1: Estimacion[] = [
    {
        id: 'est1-1',
        tipo: 'Parcial',
        monto: 15000,
        observaciones: 'Instalación de cimientos y estructura base.',
        createdAt: new Date('2024-05-15').getTime(),
        evidencias: ['https://picsum.photos/seed/est1/600/400'],
        ocRecibida: true,
    },
    {
        id: 'est1-2',
        tipo: 'Parcial',
        monto: 30000,
        observaciones: 'Instalación de sistema eléctrico y plomería.',
        createdAt: new Date('2024-06-01').getTime(),
        ocRecibida: true,
    },
    {
        id: 'est1-3',
        tipo: 'Parcial',
        monto: 25000,
        observaciones: 'Acabados interiores y pintura.',
        createdAt: new Date('2024-06-20').getTime(),
        ocRecibida: false,
    },
];

// Estimaciones para Contrato 2 (Caso Exitoso)
export const mockEstimacionesContrato2: Estimacion[] = [
    {
        id: 'est2-1',
        tipo: 'Parcial',
        monto: 250000,
        observaciones: 'Piso 1: Estructura y muros divisorios.',
        createdAt: new Date('2024-07-15').getTime(),
        ocRecibida: true,
    },
    {
        id: 'est2-2',
        tipo: 'Parcial',
        monto: 200000, // Ajustado de 300000
        observaciones: 'Pisos 2-3: Cableado estructurado y sistemas HVAC.',
        createdAt: new Date('2024-08-20').getTime(),
        ocRecibida: true,
    },
     {
        id: 'est2-3',
        tipo: 'Parcial',
        monto: 100000, // Ajustado de 150000
        observaciones: 'Pisos 4-5: Acabados finos, pintura e iluminación.',
        createdAt: new Date('2024-09-25').getTime(),
        ocRecibida: true,
    },
];


export const mockContratos: Contrato[] = [
  {
    id: 'contrato-1',
    nombre: 'Residencia Los Robles',
    cliente: 'Familia González',
    montoConIVA: 120000,
    fechaInicio: new Date('2024-05-15').getTime(),
    fechaTerminoEstimada: new Date('2024-12-15').getTime(),
    estado: 'Activo',
    faseConstructoraAprobada: true,
    faseControlPresupuestalAprobada: false,
    estimaciones: mockEstimacionesContrato1,
    montoBase: 103448.28,
    montoSinIVA: 103448.28,
    descripcion: 'Construcción completa de residencia unifamiliar.',
    createdAt: new Date('2024-05-01').getTime(),
    userId: 'user-1',
    anticipoMonto: 24000,
    anticipoFecha: new Date('2024-05-10').getTime(),
  },
  {
    id: 'contrato-2',
    nombre: 'Oficinas Corporativas Céntricas',
    cliente: 'Inmobiliaria El Sol',
    montoConIVA: 750000,
    fechaInicio: new Date('2024-07-01').getTime(),
    fechaTerminoEstimada: new Date('2025-01-30').getTime(), // Ajustado para dar más tiempo
    estado: 'Activo',
    faseConstructoraAprobada: true,
    faseControlPresupuestalAprobada: true, // Aprobado para el caso exitoso
    estimaciones: mockEstimacionesContrato2,
    montoBase: 646551.72,
    montoSinIVA: 646551.72,
    descripcion: 'Acondicionamiento de 5 pisos de oficinas.',
    createdAt: new Date('2024-06-15').getTime(),
    userId: 'user-1',
    anticipoMonto: 150000,
    anticipoFecha: new Date('2024-06-25').getTime(),
  },
  {
    id: 'contrato-3',
    nombre: 'Remodelación Tienda Principal',
    cliente: 'Modas Urbanas S.A.',
    montoConIVA: 50000,
    fechaInicio: new Date('2024-03-01').getTime(),
    fechaTerminoEstimada: new Date('2024-06-30').getTime(),
    estado: 'Cerrado',
    faseConstructoraAprobada: true,
    faseControlPresupuestalAprobada: true,
    estimaciones: [], // Se asume liquidado con el anticipo para simplificar
    montoBase: 43103.45,
    montoSinIVA: 43103.45,
    descripcion: 'Remodelación de fachada e interiores de tienda ancla.',
    createdAt: new Date('2024-02-20').getTime(),
    userId: 'user-1',
    anticipoMonto: 50000, // Anticipo liquida el total
    anticipoFecha: new Date('2024-02-25').getTime(),
  },
];

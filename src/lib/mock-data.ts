
import type { Contrato, Estimacion } from './types';

export const mockEstimaciones: Estimacion[] = [
    {
        id: 'est1',
        tipo: 'Parcial',
        monto: 15000,
        observaciones: 'Instalación de cimientos y estructura base.',
        createdAt: new Date('2024-05-15').getTime(),
        evidencias: ['https://picsum.photos/seed/est1/600/400'],
    },
    {
        id: 'est2',
        tipo: 'Parcial',
        monto: 30000,
        observaciones: 'Instalación de sistema eléctrico y plomería.',
        createdAt: new Date('2024-06-01').getTime(),
    },
    {
        id: 'est3',
        tipo: 'Parcial',
        monto: 25000,
        observaciones: 'Acabados interiores y pintura.',
        createdAt: new Date('2024-06-20').getTime(),
    },
     {
        id: 'est4',
        tipo: 'Parcial',
        monto: 40000,
        observaciones: 'Estructura principal del techo.',
        createdAt: new Date('2024-07-01').getTime(),
    },
    {
        id: 'est5',
        tipo: 'Parcial',
        monto: 22000,
        observaciones: 'Instalación de ventanas y puertas exteriores.',
        createdAt: new Date('2024-07-10').getTime(),
    },
];

export const mockContratos: (Contrato & { estimaciones: Omit<Estimacion, 'isCompleted'>[] })[] = [
  {
    id: 'contrato-1',
    nombre: 'Residencia Los Robles',
    cliente: 'Familia González',
    montoConIVA: 120000,
    fechaInicio: new Date('2024-05-15').getTime(),
    fechaTerminoEstimada: new Date('2024-12-15').getTime(),
    estado: 'Activo',
    estimaciones: [mockEstimaciones[0], mockEstimaciones[1], mockEstimaciones[2]],
    montoBase: 103448.28,
    montoSinIVA: 103448.28,
    descripcion: 'Construcción completa de residencia unifamiliar.',
    createdAt: new Date('2024-05-01').getTime(),
    userId: 'user-1'
  },
  {
    id: 'contrato-2',
    nombre: 'Oficinas Corporativas Céntricas',
    cliente: 'Inmobiliaria El Sol',
    montoConIVA: 750000,
    fechaInicio: new Date('2024-07-01').getTime(),
    fechaTerminoEstimada: new Date('2024-11-30').getTime(),
    estado: 'Activo',
    estimaciones: [mockEstimaciones[3], mockEstimaciones[4]],
    montoBase: 646551.72,
    montoSinIVA: 646551.72,
    descripcion: 'Acondicionamiento de 5 pisos de oficinas.',
    createdAt: new Date('2024-06-15').getTime(),
    userId: 'user-1'
  },
  {
    id: 'contrato-3',
    nombre: 'Remodelación Tienda Principal',
    cliente: 'Modas Urbanas S.A.',
    montoConIVA: 50000,
    fechaInicio: new Date('2024-03-01').getTime(),
    fechaTerminoEstimada: new Date('2024-06-30').getTime(),
    estado: 'Cerrado',
    estimaciones: [],
    montoBase: 43103.45,
    montoSinIVA: 43103.45,
    descripcion: 'Remodelación de fachada e interiores de tienda ancla.',
    createdAt: new Date('2024-02-20').getTime(),
    userId: 'user-1'
  },
];


import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Los 3 contratos de ejemplo, ahora con anticipos realistas.
const nuevosContratos = [
  {
    nombre: 'Construcción Oficinas Centrales',
    cliente: 'Tech Soluciones S.A. de C.V.',
    montoConIVA: 1500000.00,
    montoBase: 1293103.45,
    fechaInicio: '2024-01-15',
    fechaTerminoEstimada: '2024-12-15',
    estado: 'Activo',
    anticipoMonto: 450000.00, // 30% de anticipo
    anticipoFecha: '2024-01-10',
    faseConstructoraAprobada: true,
    faseControlPresupuestalAprobada: true, // Aprobado ya que hay anticipo
  },
  {
    nombre: 'Remodelación Lobby Hotel Paraíso',
    cliente: 'Grupo Hotelero del Sureste',
    montoConIVA: 750000.50,
    montoBase: 646552.16,
    fechaInicio: '2024-03-01',
    fechaTerminoEstimada: '2024-08-30',
    estado: 'Activo',
    anticipoMonto: 225000.15, // 30% de anticipo
    anticipoFecha: '2024-02-25',
    faseConstructoraAprobada: true,
    faseControlPresupuestalAprobada: true,
  },
  {
    nombre: 'Instalación Sistema HVAC en Plaza Comercial',
    cliente: 'Inmobiliaria del Parque',
    montoConIVA: 320000.00,
    montoBase: 275862.07,
    fechaInicio: '2024-05-20',
    fechaTerminoEstimada: '2024-09-20',
    estado: 'Pendiente', // Pendiente hasta que se aprueben las fases
    anticipoMonto: 96000.00, // 30% de anticipo
    anticipoFecha: '2024-05-15',
    faseConstructoraAprobada: false,
    faseControlPresupuestalAprobada: false,
  }
];

export async function GET() {
  try {
    // 1. Reinicio limpio de las tablas
    await sql`DROP TABLE IF EXISTS Estimaciones;`;
    await sql`DROP TABLE IF EXISTS Contratos;`;

    // 2. Re-creación del ESQUEMA con REGLA DE ANTICIPO OBLIGATORIO
    await sql`
      CREATE TABLE Contratos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        cliente VARCHAR(255) NOT NULL,
        "montoConIVA" DECIMAL(12, 2) NOT NULL,
        "fechaInicio" DATE NOT NULL,
        "fechaTerminoEstimada" DATE NOT NULL,
        "fechaFinalizacionReal" DATE,
        estado VARCHAR(50) NOT NULL CHECK (estado IN ('Activo', 'Pendiente', 'Completado', 'En Retencion')),
        "anticipoMonto" DECIMAL(12, 2) NOT NULL, -- ! REGLA: Anticipo es obligatorio
        "anticipoFecha" DATE NOT NULL,             -- ! REGLA: Fecha de anticipo es obligatoria
        "anticipoEvidencia" TEXT,
        "montoBase" DECIMAL(12, 2) NULL,
        "faseConstructoraAprobada" BOOLEAN NULL,
        "faseControlPresupuestalAprobada" BOOLEAN NULL
      );
    `;
    await sql`
      CREATE TABLE Estimaciones (
        id SERIAL PRIMARY KEY,
        "contratoId" INT REFERENCES Contratos(id) ON DELETE CASCADE,
        numero VARCHAR(50) NOT NULL,
        descripcion TEXT,
        monto DECIMAL(12, 2) NOT NULL,
        fecha DATE NOT NULL,
        evidencia TEXT,
        estado VARCHAR(50) NOT NULL CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada')),
        tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Parcial', 'Liquidación')) -- Añadida columna 'tipo' que faltaba
      );
    `;

    // 3. Inserción de los 3 contratos con anticipo
    for (const contrato of nuevosContratos) {
      await sql`
        INSERT INTO Contratos (nombre, cliente, "montoConIVA", "montoBase", "fechaInicio", "fechaTerminoEstimada", estado, "anticipoMonto", "anticipoFecha", "faseConstructoraAprobada", "faseControlPresupuestalAprobada") 
        VALUES (${contrato.nombre}, ${contrato.cliente}, ${contrato.montoConIVA}, ${contrato.montoBase}, ${contrato.fechaInicio}, ${contrato.fechaTerminoEstimada}, ${contrato.estado}, ${contrato.anticipoMonto}, ${contrato.anticipoFecha}, ${contrato.faseConstructoraAprobada}, ${contrato.faseControlPresupuestalAprobada});
      `;
    }

    return NextResponse.json(
      { message: `Base de datos reiniciada. Regla de anticipo obligatorio implementada. Se insertaron ${nuevosContratos.length} contratos con anticipo.` }, 
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

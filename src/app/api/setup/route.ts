
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Este endpoint reinicia TODA la base de datos a un estado limpio y conocido.
// Es una herramienta de desarrollo y debe usarse con precaución.
export async function GET() {
  try {
    // -- 1. Eliminar Tablas Existentes en el Orden Correcto --
    // Se elimina primero Estimaciones porque depende de Contratos.
    await sql`DROP TABLE IF EXISTS Estimaciones;`;
    await sql`DROP TABLE IF EXISTS Contratos;`;

    // -- 2. Crear Tablas con el Schema ACTUALIZADO --

    // Tabla de Contratos (Schema Moderno + Campo para Retención)
    await sql`
      CREATE TABLE Contratos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        cliente VARCHAR(255) NOT NULL,
        montoConIVA DECIMAL(12, 2) NOT NULL,
        fechaInicio DATE NOT NULL,
        fechaTerminoEstimada DATE NOT NULL,
        fechaFinalizacionReal DATE, -- El nuevo campo para la fecha de finalización real
        estado VARCHAR(50) NOT NULL CHECK (estado IN ('Activo', 'Pendiente', 'Completado', 'En Retencion')), -- Nuevo estado
        anticipoMonto DECIMAL(12, 2),
        anticipoFecha DATE,
        anticipoEvidencia TEXT
      );
    `;

    // Tabla de Estimaciones (Schema Moderno)
    await sql`
      CREATE TABLE Estimaciones (
        id SERIAL PRIMARY KEY,
        contratoId INT REFERENCES Contratos(id) ON DELETE CASCADE,
        numero VARCHAR(50) NOT NULL,
        monto DECIMAL(12, 2) NOT NULL,
        fecha DATE NOT NULL,
        evidencia TEXT,
        estado VARCHAR(50) NOT NULL CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada'))
      );
    `;

    // -- 3. (Opcional) Insertar Datos de Ejemplo si es necesario --
    // Por ahora, lo dejaremos limpio para evitar inconsistencias.

    return NextResponse.json(
      { message: 'Base de datos reiniciada con el schema actualizado (Contratos + Estimaciones).' }, 
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

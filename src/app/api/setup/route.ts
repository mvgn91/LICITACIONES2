
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Crear tabla de contratos
    await sql`
      CREATE TABLE IF NOT EXISTS contratos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        cliente VARCHAR(255) NOT NULL,
        montoTotal NUMERIC(15, 2) NOT NULL,
        fechaInicio TIMESTAMP,
        fechaFin TIMESTAMP,
        anticipo BOOLEAN DEFAULT false,
        estimaciones BOOLEAN DEFAULT false,
        garantia BOOLEAN DEFAULT false,
        finiquito BOOLEAN DEFAULT false,
        estado VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Crear tabla de estimaciones
    await sql`
      CREATE TABLE IF NOT EXISTS estimaciones (
        id SERIAL PRIMARY KEY,
        contratoId INTEGER REFERENCES contratos(id),
        tipo VARCHAR(50) NOT NULL,
        monto NUMERIC(15, 2) NOT NULL,
        observaciones TEXT,
        ordenCompraUrl VARCHAR(255),
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        evidencias TEXT[]
      );
    `;

    return NextResponse.json({ message: 'Tablas creadas exitosamente' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

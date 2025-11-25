
import { sql } from '@vercel/postgres';

export async function createContractsTable() {
  const result = await sql`
    CREATE TABLE IF NOT EXISTS contratos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      cliente VARCHAR(255) NOT NULL,
      estado VARCHAR(50) NOT NULL DEFAULT 'Activo',
      fechaInicio DATE NOT NULL,
      fechaFin DATE,
      fechaTerminoEstimada DATE,
      montoBase NUMERIC(15, 2),
      montoTotal NUMERIC(15, 2) NOT NULL,
      anticipoMonto NUMERIC(15, 2),
      anticipoFecha DATE,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('Table creation result:', result);
  return result;
}

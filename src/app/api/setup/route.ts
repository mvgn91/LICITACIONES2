
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const contratosDeEjemplo = [
  {
    nombre: 'Contrato de Desarrollo de Software',
    cliente: 'Tech Solutions Inc.',
    estado: 'Activo',
    fecha_inicio: '2024-01-15',
    fecha_fin: '2024-12-31',
    fecha_termino_estimada: '2024-12-15',
    monto_base: 50000,
    monto_total: 58000,
    anticipo_monto: 10000,
    anticipo_fecha: '2024-01-20'
  },
  {
    nombre: 'Contrato de Mantenimiento de Redes',
    cliente: 'Global Logistics',
    estado: 'Pendiente',
    fecha_inicio: '2024-03-01',
    fecha_fin: '2025-02-28',
    fecha_termino_estimada: '2025-02-20',
    monto_base: 25000,
    monto_total: 29000,
    anticipo_monto: 5000,
    anticipo_fecha: '2024-03-05'
  },
  {
    nombre: 'Contrato de Consultoría de Seguridad',
    cliente: 'Secure Finance Corp',
    estado: 'Completado',
    fecha_inicio: '2023-09-01',
    fecha_fin: '2024-08-31',
    fecha_termino_estimada: '2024-08-25',
    monto_base: 75000,
    monto_total: 87000,
    anticipo_monto: 15000,
    anticipo_fecha: '2023-09-10'
  }
];

export async function GET() {
  try {
    // Usamos CASCADE para eliminar la tabla y todas sus dependencias (ej. secuencias)
    await sql`DROP TABLE IF EXISTS contratos CASCADE;`;

    await sql`
        CREATE TABLE contratos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            cliente VARCHAR(255) NOT NULL,
            estado VARCHAR(50) NOT NULL,
            fecha_inicio DATE,
            fecha_fin DATE,
            fecha_termino_estimada DATE,
            monto_base NUMERIC,
            monto_total NUMERIC,
            anticipo_monto NUMERIC,
            anticipo_fecha DATE,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    for (const contrato of contratosDeEjemplo) {
      await sql`
        INSERT INTO contratos (
          nombre, cliente, estado, fecha_inicio, fecha_fin, fecha_termino_estimada, 
          monto_base, monto_total, anticipo_monto, anticipo_fecha
        ) VALUES (
          ${contrato.nombre}, ${contrato.cliente}, ${contrato.estado}, ${contrato.fecha_inicio}, 
          ${contrato.fecha_fin}, ${contrato.fecha_termino_estimada}, ${contrato.monto_base}, 
          ${contrato.monto_total}, ${contrato.anticipo_monto}, ${contrato.anticipo_fecha}
        );
      `;
    }

    return NextResponse.json({ message: 'Base de datos reiniciada. Tabla de contratos creada y datos de ejemplo insertados.' }, { status: 200 });

  } catch (error) {
    console.error('Database setup failed:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

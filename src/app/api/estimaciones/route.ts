
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { Estimacion } from '@/lib/types';

// Función para limpiar y convertir valores monetarios a números
const parseCurrency = (value: string | number | null): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const cleanedValue = String(value).replace(/[^\d.-]/g, '');
  const number = parseFloat(cleanedValue);
  return isNaN(number) ? 0 : number;
};

// Función centralizada para mapear los datos de la BD al formato del Frontend
const mapEstimacionToFrontend = (dbRow: any): Estimacion => {
  return {
    id: dbRow.id,
    contratoId: dbRow.contrato_id,
    numero: dbRow.numero,
    monto: parseCurrency(dbRow.monto), // CORRECCIÓN CENTRAL
    fecha: dbRow.fecha,
    estado: dbRow.estado,
    evidencia: dbRow.evidencia || undefined,
    descripcion: dbRow.descripcion || '',
    tipo: dbRow.tipo || 'Parcial',
  };
};

// GET /api/estimaciones?contrato_id=<uuid>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contratoId = searchParams.get('contrato_id');

  if (!contratoId) {
    return NextResponse.json({ error: 'El ID del contrato es requerido' }, { status: 400 });
  }

  try {
    // Añadimos 'descripcion' y 'tipo' a la consulta si existen en la tabla
    const { rows } = await sql`
      SELECT id, contrato_id, numero, monto, fecha, estado, evidencia
      FROM estimaciones 
      WHERE contrato_id = ${contratoId}
      ORDER BY fecha DESC, id DESC;
    `;
    
    // Usamos la función de mapeo para consistencia
    const estimaciones = rows.map(mapEstimacionToFrontend);

    return NextResponse.json({ estimaciones });

  } catch (error) {
    console.error("[API_ESTIMACIONES_GET_ERROR]", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/estimaciones
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      contrato_id,
      monto,
      observaciones, 
      evidencia, 
      estado = 'Pendiente',
      tipo = 'Parcial'
    } = body;

    if (!contrato_id || monto === undefined) {
        return NextResponse.json({ error: 'Faltan campos requeridos: contrato_id, monto' }, { status: 400 });
    }

    const numero = `EST-${Date.now()}`;
    const fecha = new Date().toISOString().split('T')[0]; 

    // Guardamos el monto como número, y la descripción
    const result = await sql`
      INSERT INTO estimaciones (contrato_id, numero, monto, fecha, estado, evidencia, descripcion, tipo)
      VALUES (${contrato_id}, ${numero}, ${monto}, ${fecha}, ${estado}, ${evidencia || null}, ${observaciones || ''}, ${tipo})
      RETURNING *;
    `;

    const nuevaEstimacion = mapEstimacionToFrontend(result.rows[0]);

    return NextResponse.json({ estimacion: nuevaEstimacion }, { status: 201 });

  } catch (error) {
    console.error("[API_ESTIMACIONES_POST_ERROR]", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

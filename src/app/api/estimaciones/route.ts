
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Obtener todas las estimaciones de un contrato
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contratoId = searchParams.get('contrato_id');

  if (!contratoId) {
    return NextResponse.json({ error: 'El ID del contrato es requerido' }, { status: 400 });
  }

  try {
    const estimaciones = await sql`
      SELECT * FROM estimaciones 
      WHERE contrato_id = ${parseInt(contratoId, 10)}
      ORDER BY created_at DESC;
    `;
    return NextResponse.json({ estimaciones: estimaciones.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Crear una nueva estimación
export async function POST(request: Request) {
  try {
    const { contrato_id, tipo, monto, observaciones } = await request.json();

    if (!contrato_id || !tipo || !monto) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO estimaciones (contrato_id, tipo, monto, observaciones)
      VALUES (${contrato_id}, ${tipo}, ${monto}, ${observaciones})
      RETURNING *;
    `;

    return NextResponse.json({ estimacion: result.rows[0] }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

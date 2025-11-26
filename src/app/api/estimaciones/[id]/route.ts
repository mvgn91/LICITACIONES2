
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// PUT /api/estimaciones/[id]
// Actualiza una estimación específica.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { monto, descripcion } = body;

    if (!monto) {
      return NextResponse.json({ error: 'El monto es un campo requerido.' }, { status: 400 });
    }

    const result = await sql`
      UPDATE Estimaciones
      SET 
        monto = ${monto},
        descripcion = ${descripcion || ''}
      WHERE id = ${Number(id)}
      RETURNING *;
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Estimación no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ estimacion: result.rows[0] });

  } catch (error) {
    console.error("[API_ESTIMACIONES_PUT_ERROR]", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

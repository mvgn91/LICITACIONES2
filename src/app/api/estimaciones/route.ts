
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/estimaciones?contrato_id=1
// Obtiene todas las estimaciones para un contrato específico.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contratoId = searchParams.get('contrato_id');

  if (!contratoId) {
    return NextResponse.json({ error: 'El ID del contrato es requerido' }, { status: 400 });
  }

  try {
    const { rows } = await sql`
      SELECT id, "contratoId", numero, tipo, descripcion, monto, fecha, estado, evidencia 
      FROM Estimaciones 
      WHERE "contratoId" = ${Number(contratoId)}
      ORDER BY fecha DESC, id DESC; -- Ordenar por fecha y luego por ID para consistencia
    `;
    return NextResponse.json({ estimaciones: rows });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/estimaciones
// Crea una nueva estimación, ahora incluyendo el campo de evidencia.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      contrato_id,
      tipo,
      monto,
      observaciones,
      evidencia, // <-- ¡Nuevo campo!
      estado = 'Pendiente' // Valor por defecto
    } = body;

    if (!contrato_id || !monto || !tipo) {
        return NextResponse.json({ error: 'Faltan campos requeridos: contrato_id, monto, tipo' }, { status: 400 });
    }

    // 1. Obtener el último número de estimación para este contrato
    const lastEstimation = await sql`
        SELECT numero FROM Estimaciones 
        WHERE "contratoId" = ${contrato_id} 
        ORDER BY id DESC LIMIT 1;`;

    let nextNumero = 1;
    if (lastEstimation.rows.length > 0) {
        const lastNum = parseInt(lastEstimation.rows[0].numero, 10);
        if (!isNaN(lastNum)) {
            nextNumero = lastNum + 1;
        }
    }

    const fecha = new Date().toISOString();
    
    // 2. Insertar la nueva estimación
    const result = await sql`
      INSERT INTO Estimaciones ("contratoId", numero, tipo, descripcion, monto, fecha, estado, evidencia)
      VALUES (${contrato_id}, ${String(nextNumero)}, ${tipo}, ${observaciones || ''}, ${monto}, ${fecha}, ${estado}, ${evidencia || null})
      RETURNING *;
    `;

    return NextResponse.json({ estimacion: result.rows[0] }, { status: 201 });

  } catch (error) {
    console.error("[API_ESTIMACIONES_POST_ERROR]", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

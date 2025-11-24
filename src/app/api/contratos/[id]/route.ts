
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Maneja las solicitudes GET para obtener un contrato específico por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const result = await sql`
      SELECT 
        c.id,
        c.nombre,
        c.cliente,
        c.fecha_inicio AS "fechaInicio",
        c.fecha_fin AS "fechaFin",
        c.monto_base AS "montoBase",
        c.monto_con_iva AS "montoConIVA",
        c.anticipo_monto AS "anticipoMonto",
        c.estado
      FROM contratos c
      WHERE c.id = ${id};
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ contrato: result.rows[0] });

  } catch (error) {
    console.error('Error fetching contract by ID:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// TODO: Implementar PUT para actualizar un contrato
// TODO: Implementar DELETE para eliminar un contrato

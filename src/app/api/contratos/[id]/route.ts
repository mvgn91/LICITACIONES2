
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const {
      nombre,
      cliente,
      montoConIVA,
      descripcion,
      fechaInicio,
      fechaTerminoEstimada,
      anticipoMonto,
      anticipoFecha,
      estado,
    } = await request.json();

    if (!nombre || !cliente || !montoConIVA || !fechaInicio || !fechaTerminoEstimada) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const montoBase = Number(montoConIVA) / 1.16;

    const result = await sql`
      UPDATE contratos
      SET
        nombre = ${nombre},
        cliente = ${cliente},
        "montoConIVA" = ${Number(montoConIVA)},
        descripcion = ${descripcion},
        "montoBase" = ${montoBase},
        "montoSinIVA" = ${montoBase},
        "fechaInicio" = ${new Date(fechaInicio).toISOString()},
        "fechaTerminoEstimada" = ${new Date(fechaTerminoEstimada).toISOString()},
        "anticipoMonto" = ${Number(anticipoMonto)},
        "anticipoFecha" = ${new Date(anticipoFecha).toISOString()},
        estado = ${estado}
      WHERE id = ${Number(id)}
      RETURNING *;
    `;

    if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Contrato no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ contrato: result.rows[0] });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ordenar por fecha de creación para mostrar los más nuevos primero
    const { rows } = await sql`SELECT * FROM contratos ORDER BY "createdAt" DESC;`;
    return NextResponse.json({ contratos: rows });
  } catch (error) {
    // Si la tabla aún no existe, no tratarlo como un error fatal.
    if ((error as any).message.includes('relation "contratos" does not exist')) {
       return NextResponse.json({ contratos: [] });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      nombre,
      cliente,
      montoConIVA,
      descripcion,
      fechaInicio,
      fechaTerminoEstimada,
      anticipoMonto,
      anticipoFecha,
    } = await request.json();

    if (!nombre || !cliente || !montoConIVA || !fechaInicio || !fechaTerminoEstimada) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const montoBase = Number(montoConIVA) / 1.16;

    const result = await sql`
      INSERT INTO contratos (
        nombre,
        cliente,
        "montoConIVA",
        descripcion,
        "montoBase",
        "montoSinIVA",
        "fechaInicio",
        "fechaTerminoEstimada",
        "anticipoMonto",
        "anticipoFecha",
        estado,
        "createdAt",
        "userId"
      )
      VALUES (
        ${nombre},
        ${cliente},
        ${Number(montoConIVA)},
        ${descripcion},
        ${montoBase},
        ${montoBase},
        ${new Date(fechaInicio).toISOString()},
        ${new Date(fechaTerminoEstimada).toISOString()},
        ${Number(anticipoMonto)},
        ${new Date(anticipoFecha).toISOString()},
        'Activo',
        NOW(),
        'api-user'
      )
      RETURNING *;
    `;

    return NextResponse.json({ contrato: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

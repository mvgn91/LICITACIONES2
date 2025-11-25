import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        id, nombre, cliente, estado, 
        fechainicio AS "fechaInicio",
        fechafin AS "fechaFin",
        montototal AS "montoConIVA"
      FROM contratos ORDER BY id DESC;
    `;
    return NextResponse.json({ contratos: rows });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const { 
          nombre, cliente, estado, 
          fechaInicio, fechaFin, fechaTerminoEstimada, 
          montoBase, montoConIVA, 
          anticipoMonto, anticipoFecha 
        } = await request.json();

        const result = await sql`
            INSERT INTO contratos (
              nombre, cliente, estado, 
              fechainicio, fechafin, fechaterminoestimada, 
              montobase, montototal, 
              anticipomonto, anticipofecha
            ) VALUES (
              ${nombre}, ${cliente}, ${estado}, 
              ${fechaInicio}, ${fechaFin}, ${fechaTerminoEstimada}, 
              ${montoBase}, ${montoConIVA}, 
              ${anticipoMonto}, ${anticipoFecha}
            ) RETURNING *;
        `;

        return NextResponse.json({ contrato: result.rows[0] }, { status: 201 });

    } catch (error) {
        console.error('Error creating contract:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

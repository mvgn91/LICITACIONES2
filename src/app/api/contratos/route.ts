import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Seleccionar la columna monto_total y devolverla con el alias montoConIVA para el frontend
    const { rows } = await sql`
      SELECT 
        id, nombre, cliente, estado, 
        fecha_inicio AS "fechaInicio",  
        fechafin AS "fechaFin", -- CORREGIDO
        monto_total AS "montoConIVA"
      FROM contratos ORDER BY id DESC;
    `;
    return NextResponse.json({ contratos: rows });
  } catch (error) {
    if ((error as any).message.includes('relation "contratos" does not exist')) {
        const { rows } = await sql`SELECT id, nombre, cliente, estado, fechafin AS "fechaFin", monto_total AS "montoConIVA" FROM contratos ORDER BY id DESC;`;
        return NextResponse.json({ contratos: rows });
    }
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const { 
          nombre, cliente, descripcion, estado, 
          fechaInicio, fechaFin, fechaTerminoEstimada, 
          montoBase, montoConIVA, 
          anticipoMonto, anticipoFecha 
        } = await request.json();

        // CORREGIDO: Usar los nombres de columna correctos de la base de datos
        const result = await sql`
            INSERT INTO contratos (
              nombre, cliente, descripcion, estado, 
              fecha_inicio, fechafin, fecha_termino_estimada, 
              monto_base, monto_total, 
              anticipo_monto, anticipo_fecha
            ) VALUES (
              ${nombre}, ${cliente}, ${descripcion}, ${estado}, 
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

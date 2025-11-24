
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Seleccionar la columna monto_total y devolverla con el alias montoConIVA para el frontend
    const { rows } = await sql`
      SELECT 
        id, nombre, cliente, estado, 
        fecha_inicio AS "fechaInicio", 
        fecha_fin AS "fechaFin",
        monto_total AS "montoConIVA" -- CORREGIDO
      FROM contratos ORDER BY id DESC;
    `;
    return NextResponse.json({ contratos: rows });
  } catch (error) {
    if ((error as any).message.includes('relation "contratos" does not exist')) {
       return NextResponse.json({ contratos: [] });
    }
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      nombre,
      cliente,
      montoConIVA, // El frontend envía montoConIVA
      descripcion,
      fechaInicio,
      fechaTerminoEstimada,
      anticipoMonto,
      anticipoFecha,
    } = await request.json();

    const montoBase = montoConIVA / 1.16;
    const estado = 'Activo';

    const result = await sql`
      INSERT INTO contratos 
        (nombre, cliente, monto_base, monto_total, descripcion, fecha_inicio, fecha_termino_estimada, anticipo_monto, anticipo_fecha, estado)
      VALUES 
        (${nombre}, ${cliente}, ${montoBase}, ${montoConIVA}, ${descripcion}, ${fechaInicio}, ${fechaTerminoEstimada}, ${anticipoMonto}, ${anticipoFecha}, ${estado})
      RETURNING 
        id, nombre, cliente, estado, 
        fecha_inicio AS "fechaInicio", 
        fecha_fin AS "fechaFin",
        monto_total AS "montoConIVA"; -- CORREGIDO
    `;

    return NextResponse.json({ contrato: result.rows[0] }, { status: 201 });

  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

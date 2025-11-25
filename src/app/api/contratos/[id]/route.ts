
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { rows } = await sql`
            SELECT 
                id, nombre, cliente, estado,
                fecha_inicio AS "fechaInicio",
                fecha_fin AS "fechaFin",
                fecha_termino_estimada AS "fechaTerminoEstimada",
                monto_base AS "montoBase",
                monto_total AS "montoConIVA",
                anticipo_monto AS "anticipoMonto",
                anticipo_fecha AS "anticipoFecha"
            FROM contratos WHERE id = ${id};
        `;
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }
        return NextResponse.json({ contrato: rows[0] });
    } catch (error) {
        console.error('Error fetching contract:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { 
          nombre, cliente, estado, 
          fechaInicio, fechaFin, fechaTerminoEstimada, 
          montoBase, montoConIVA, 
          anticipoMonto, anticipoFecha 
        } = await request.json();

        const result = await sql`
            UPDATE contratos SET 
              nombre = ${nombre}, 
              cliente = ${cliente}, 
              estado = ${estado}, 
              fecha_inicio = ${fechaInicio}, 
              fecha_fin = ${fechaFin}, 
              fecha_termino_estimada = ${fechaTerminoEstimada}, 
              monto_base = ${montoBase}, 
              monto_total = ${montoConIVA}, 
              anticipo_monto = ${anticipoMonto}, 
              anticipo_fecha = ${anticipoFecha}
            WHERE id = ${id} RETURNING *;
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        const updatedContract = {
            ...result.rows[0],
            fechaInicio: result.rows[0].fecha_inicio,
            fechaFin: result.rows[0].fecha_fin,
            fechaTerminoEstimada: result.rows[0].fecha_termino_estimada,
            montoBase: result.rows[0].monto_base,
            montoConIVA: result.rows[0].monto_total,
            anticipoMonto: result.rows[0].anticipo_monto,
            anticipoFecha: result.rows[0].anticipo_fecha
        }

        return NextResponse.json({ contrato: updatedContract });

    } catch (error) {
        console.error('Error updating contract:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM contratos WHERE id = ${id} RETURNING *;`;
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { rows } = await sql`
            SELECT 
                id, nombre, cliente, estado, descripcion,
                fecha_inicio AS \"fechaInicio\",  
                fechafin AS \"fechaFin\",
                fechaterminoestimada AS \"fechaTerminoEstimada\",
                montobase AS \"montoBase\",
                montototal AS \"montoConIVA\",
                anticipomonto AS \"anticipoMonto\",
                anticipofecha AS \"anticipoFecha\"
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
          nombre, cliente, descripcion, estado, 
          fechaInicio, fechaFin, fechaTerminoEstimada, 
          montoBase, montoConIVA, 
          anticipoMonto, anticipoFecha 
        } = await request.json();

        const result = await sql`
            UPDATE contratos SET 
              nombre = ${nombre}, 
              cliente = ${cliente}, 
              descripcion = ${descripcion}, 
              estado = ${estado}, 
              fecha_inicio = ${fechaInicio}, 
              fechafin = ${fechaFin}, 
              fechaterminoestimada = ${fechaTerminoEstimada}, 
              montobase = ${montoBase}, 
              montototal = ${montoConIVA}, 
              anticipomonto = ${anticipoMonto}, 
              anticipofecha = ${anticipoFecha}
            WHERE id = ${id} RETURNING *;
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        return NextResponse.json({ contrato: result.rows[0] });

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


import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { Contrato, EstadoContrato } from '@/lib/types';

// GET: Obtener un contrato específico por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { rows } = await sql<Contrato>`SELECT * FROM Contratos WHERE id = ${id};`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ contrato: rows[0] });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// PUT: Actualizar un contrato completo (no usado para el flujo de aprobación)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const contrato: Partial<Contrato> = await request.json();

    let estadoFinal: EstadoContrato | undefined = contrato.estado;
    let fechaFinalizacion: string | null = null;

    if (contrato.estado === 'Completado') {
      estadoFinal = 'En Retencion';
      fechaFinalizacion = new Date().toISOString().split('T')[0];
    }

    const result = await sql`
      UPDATE Contratos
      SET 
        nombre = ${contrato.nombre},
        cliente = ${contrato.cliente},
        "montoConIVA" = ${contrato.montoConIVA},
        "fechaInicio" = ${contrato.fechaInicio},
        "fechaTerminoEstimada" = ${contrato.fechaTerminoEstimada},
        "anticipoMonto" = ${contrato.anticipoMonto},
        "anticipoFecha" = ${contrato.anticipoFecha},
        "anticipoEvidencia" = ${contrato.anticipoEvidencia},
        estado = ${estadoFinal},
        "fechaFinalizacionReal" = ${fechaFinalizacion}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado para actualizar' }, { status: 404 });
    }

    return NextResponse.json({ contrato: result.rows[0] });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// *** ¡NUEVO! PATCH: Actualizar campos específicos como el flujo de aprobación ***
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const { faseConstructoraAprobada, faseControlPresupuestalAprobada } = body;

    // Validar que al menos uno de los campos esperados esté presente
    if (faseConstructoraAprobada === undefined && faseControlPresupuestalAprobada === undefined) {
      return NextResponse.json({ error: 'No se proporcionaron campos válidos para actualizar.' }, { status: 400 });
    }

    const result = await sql`
      UPDATE Contratos
      SET 
        "faseConstructoraAprobada" = ${faseConstructoraAprobada},
        "faseControlPresupuestalAprobada" = ${faseControlPresupuestalAprobada}
      WHERE id = ${id}
      RETURNING id, "faseConstructoraAprobada", "faseControlPresupuestalAprobada";
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado para actualizar.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Flujo de aprobación actualizado', contrato: result.rows[0] });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: Eliminar un contrato por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM Contratos WHERE id = ${id} RETURNING *;`;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado para eliminar' }, { status: 404 });
    }
    
    return NextResponse.json({ message: `Contrato con id ${id} eliminado exitosamente.` });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

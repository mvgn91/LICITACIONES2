
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

// Esquema de validación para la actualización
const updateContractSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  cliente: z.string().min(3, 'El cliente debe tener al menos 3 caracteres.'),
  montoConIVA: z.coerce.number().positive('El monto total debe ser un número positivo.'),
  fechaInicio: z.coerce.date(),
  fechaTerminoEstimada: z.coerce.date(),
  anticipoMonto: z.coerce.number().nonnegative('El monto del anticipo no puede ser negativo.').optional(),
  anticipoFecha: z.coerce.date().optional(),
});


// --- MANEJADOR GET: Obtener un contrato por ID ---
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const result = await sql`
      SELECT 
        c.id, c.nombre, c.cliente, c.descripcion, c.estado,
        c.fecha_inicio AS "fechaInicio",
        c.fecha_fin AS "fechaFin",
        c.fecha_termino_estimada AS "fechaTerminoEstimada",
        c.monto_base AS "montoBase",
        c.monto_total AS "montoConIVA", -- CORREGIDO: Usar monto_total y devolverlo como montoConIVA
        c.anticipo_monto AS "anticipoMonto",
        c.anticipo_fecha AS "anticipoFecha"
      FROM contratos c
      WHERE c.id = ${id};
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ contrato: result.rows[0] });

  } catch (error) {
    console.error('Error fetching contract by ID:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener el contrato' }, { status: 500 });
  }
}

// --- MANEJADOR PUT: Actualizar un contrato existente ---
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let data;

  try {
    data = await request.json();
    const validatedData = updateContractSchema.parse(data);

    const montoBase = validatedData.montoConIVA / 1.16;

    const result = await sql`
      UPDATE contratos
      SET
        nombre = ${validatedData.nombre},
        cliente = ${validatedData.cliente},
        fecha_inicio = ${validatedData.fechaInicio.toISOString()},
        fecha_termino_estimada = ${validatedData.fechaTerminoEstimada.toISOString()},
        monto_base = ${montoBase},
        monto_total = ${validatedData.montoConIVA}, -- CORREGIDO: Usar la columna correcta monto_total
        anticipo_monto = ${validatedData.anticipoMonto},
        anticipo_fecha = ${validatedData.anticipoFecha ? validatedData.anticipoFecha.toISOString() : null}
      WHERE id = ${id}
      RETURNING 
        id, nombre, cliente, descripcion, estado,
        fecha_inicio AS "fechaInicio",
        fecha_fin AS "fechaFin",
        fecha_termino_estimada AS "fechaTerminoEstimada",
        monto_base AS "montoBase",
        monto_total AS "montoConIVA", -- CORREGIDO: Devolver monto_total como montoConIVA
        anticipo_monto AS "anticipoMonto",
        anticipo_fecha AS "anticipoFecha";
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado para actualizar' }, { status: 404 });
    }

    return NextResponse.json({ contrato: result.rows[0] });

  } catch (error) {
    console.error('Error updating contract:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor al actualizar el contrato' }, { status: 500 });
  }
}

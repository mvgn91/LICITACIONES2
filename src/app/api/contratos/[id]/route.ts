import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { Contrato } from '@/lib/types';

// Función para limpiar y convertir valores monetarios a números
const parseCurrency = (value: string | number | null): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const cleanedValue = String(value).replace(/[^\d.-]/g, '');
  const number = parseFloat(cleanedValue);
  return isNaN(number) ? 0 : number;
};

// Función para manejar fechas que pueden ser nulas
const formatDateSafely = (date: string | null | undefined): string | undefined => {
    if (!date) return undefined;
    try {
        // Devuelve solo la parte de la fecha en formato YYYY-MM-DD
        return new Date(date).toISOString().split('T')[0];
    } catch (error) {
        return undefined;
    }
};


// Función centralizada y robusta para mapear los datos de la BD al formato del Frontend
const mapContratoToFrontend = (contratoData: any): Contrato => {
    const montoConIVA = parseCurrency(contratoData.monto_total);
    const anticipoMonto = parseCurrency(contratoData.amortizacion);

    return {
        id: contratoData.id,
        nombre: contratoData.nombre,
        cliente: contratoData.cliente,
        numeroContrato: contratoData.numero_contrato,
        objeto: contratoData.objeto,
        localizacion: contratoData.localizacion,
        
        montoConIVA: montoConIVA,
        montoBase: montoConIVA / 1.16, 
        anticipoMonto: anticipoMonto,

        fechaInicio: formatDateSafely(contratoData.fecha_inicio),
        fechaTerminoEstimada: formatDateSafely(contratoData.fecha_fin),
        anticipoFecha: formatDateSafely(contratoData.fecha_amortizacion),
        fechaFinalizacionReal: formatDateSafely(contratoData.fecha_finalizacion_real),

        estado: contratoData.estado,
        anticipoEvidencia: contratoData.anticipo_evidencia || undefined,

        faseConstructoraAprobada: false,
        faseControlPresupuestalAprobada: false,
    };
}

// GET: Obtener un contrato específico por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { rows } = await sql`
      SELECT c.*, cl.name as cliente
      FROM contratos c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE c.id = ${id};
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }
    
    const contrato = mapContratoToFrontend(rows[0]);
    return NextResponse.json({ contrato });

  } catch (error) {
    console.error('[API_CONTRATO_GET_ERROR]', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// PUT: Actualizar un contrato
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body: Partial<Contrato> = await request.json();

    const fechaInicio = body.fechaInicio || null;
    const fechaTerminoEstimada = body.fechaTerminoEstimada || null;
    const anticipoFecha = body.anticipoFecha || null;

    const result = await sql`
      UPDATE contratos
      SET 
        nombre = ${body.nombre},
        cliente_id = (SELECT id FROM clientes WHERE name = ${body.cliente} LIMIT 1),
        numero_contrato = ${body.numeroContrato},
        monto_total = ${body.montoConIVA},
        fecha_inicio = ${fechaInicio},
        fecha_fin = ${fechaTerminoEstimada},
        amortizacion = ${body.anticipoMonto},
        fecha_amortizacion = ${anticipoFecha},
        estado = ${body.estado},
        objeto = ${body.objeto},
        localizacion = ${body.localizacion}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado para actualizar' }, { status: 404 });
    }

    const updatedResult = await sql`
        SELECT c.*, cl.name as cliente
        FROM contratos c
        LEFT JOIN clientes cl ON c.cliente_id = cl.id
        WHERE c.id = ${id};
    `;

    const contrato = mapContratoToFrontend(updatedResult.rows[0]);
    return NextResponse.json({ contrato });

  } catch (error) {
    console.error('[API_CONTRATO_PUT_ERROR]', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

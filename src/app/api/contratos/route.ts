
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Lee los contratos de la base de datos
export async function GET() {
    try {
        // La consulta SQL ahora refleja el schema ACTUAL de la tabla Contratos.
        const { rows } = await sql`
            SELECT 
                id, 
                nombre, 
                cliente, 
                estado,
                "montoConIVA",
                "montoBase",
                "fechaInicio",
                "fechaTerminoEstimada",
                "fechaFinalizacionReal",
                "anticipoMonto",
                "anticipoFecha",
                "anticipoEvidencia",
                "faseConstructoraAprobada",
                "faseControlPresupuestalAprobada"
            FROM contratos 
            ORDER BY id ASC; 
        `;

        // No es necesario mapear, los nombres ya coinciden con el frontend
        return NextResponse.json({ contratos: rows });

    } catch (error) {
        console.error('Error al obtener los contratos:', error);
        // Devuelve el mensaje de error real para facilitar el debug
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// Crea un nuevo contrato en la base de datos
export async function POST(request: Request) {
    try {
        const { 
            nombre, cliente, estado,
            fechaInicio, fechaTerminoEstimada, 
            montoBase, montoConIVA, 
            anticipoMonto, anticipoFecha 
        } = await request.json();

        // La consulta INSERT ahora usa los nombres de columna correctos.
        const result = await sql`
            INSERT INTO contratos (
                nombre, cliente, estado, 
                "fechaInicio", "fechaTerminoEstimada", 
                "montoBase", "montoConIVA", 
                "anticipoMonto", "anticipoFecha"
            ) VALUES (
                ${nombre}, ${cliente}, ${estado}, 
                ${fechaInicio}, ${fechaTerminoEstimada}, 
                ${montoBase}, ${montoConIVA}, 
                ${anticipoMonto}, ${anticipoFecha}
            ) RETURNING *;
        `;

        return NextResponse.json({ contrato: result.rows[0] });

    } catch (error) {
        console.error('Error al crear el contrato:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}


import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Sanity check para asegurar que la tabla existe
        // Esto es temporal, pero te dará un error más claro si la tabla sigue sin crearse
        try {
            await sql`SELECT 1 FROM contratos LIMIT 1;`;
        } catch (tableError) {
            console.error("La tabla 'contratos' no existe.", tableError);
            return NextResponse.json({ error: "La tabla 'contratos' no existe. Ejecuta /api/setup para crearla." }, { status: 500 });
        }

        const { rows } = await sql`
            SELECT 
                id, nombre, cliente, estado,
                fecha_inicio AS "fechaInicio",
                fecha_fin AS "fechaFin",
                fecha_termino_estimada AS "fechaTerminoEstimada",
                monto_base AS "montoBase",
                monto_total AS "montoConIVA",
                anticipo_monto AS "anticipoMonto",
                anticipo_fecha AS "anticipoFecha",
                createdAt
            FROM contratos ORDER BY createdAt DESC;
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
                fecha_inicio, fecha_fin, fecha_termino_estimada, 
                monto_base, monto_total, 
                anticipo_monto, anticipo_fecha
            ) VALUES (
                ${nombre}, ${cliente}, ${estado}, 
                ${fechaInicio}, ${fechaFin}, ${fechaTerminoEstimada}, 
                ${montoBase}, ${montoConIVA}, 
                ${anticipoMonto}, ${anticipoFecha}
            ) RETURNING *;
        `;

        const newContract = {
            ...result.rows[0],
            fechaInicio: result.rows[0].fecha_inicio,
            fechaFin: result.rows[0].fecha_fin,
            fechaTerminoEstimada: result.rows[0].fecha_termino_estimada,
            montoBase: result.rows[0].monto_base,
            montoConIVA: result.rows[0].monto_total,
            anticipoMonto: result.rows[0].anticipo_monto,
            anticipoFecha: result.rows[0].anticipo_fecha
        };

        return NextResponse.json({ contrato: newContract });
    } catch (error) {
        console.error('Error creating contract:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM contratos;`;
    return NextResponse.json({ contratos: rows });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, cliente, montoTotal } = await request.json();
    if (!nombre || !cliente || !montoTotal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await sql`
      INSERT INTO contratos (nombre, cliente, montoTotal, estado)
      VALUES (${nombre}, ${cliente}, ${montoTotal}, 'Activo');
    `;
    const { rows } = await sql`SELECT * FROM contratos ORDER BY id DESC LIMIT 1;`;
    return NextResponse.json({ contrato: rows[0] });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

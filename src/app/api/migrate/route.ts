
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  let message = '';
  try {
    await sql`ALTER TABLE contratos ADD COLUMN fecha_inicio DATE;`;
    message += 'Column "fecha_inicio" added successfully. ';
  } catch (error) {
    if ((error as Error).message.includes('column "fecha_inicio" of relation "contratos" already exists')) {
      message += 'Column "fecha_inicio" already exists, skipping. ';
    } else {
      return NextResponse.json({ error: `Error adding column "fecha_inicio": ${(error as Error).message}` }, { status: 500 });
    }
  }

  try {
    await sql`ALTER TABLE contratos ADD COLUMN monto_base NUMERIC;`;
    message += 'Column "monto_base" added successfully.';
  } catch (error) {
    if ((error as Error).message.includes('column "monto_base" of relation "contratos" already exists')) {
      message += 'Column "monto_base" already exists, skipping.';
    } else {
      return NextResponse.json({ error: `Error adding column "monto_base": ${(error as Error).message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ message });
}

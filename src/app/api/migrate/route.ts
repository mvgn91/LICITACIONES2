
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createContractsTable } from '../contratos/migration';

export async function GET() {
  try {
    await createContractsTable();
    
    try {
      await sql`ALTER TABLE contratos ADD COLUMN fecha_inicio DATE;`;
      console.log('Column "fecha_inicio" added successfully.');
    } catch (error) {
      if ((error as Error).message.includes('column "fecha_inicio" of relation "contratos" already exists')) {
        console.log('Column "fecha_inicio" already exists, skipping.');
      } else {
        throw error;
      }
    }

    try {
      await sql`ALTER TABLE contratos ADD COLUMN monto_base NUMERIC;`;
      console.log('Column "monto_base" added successfully.');
    } catch (error) {
      if ((error as Error).message.includes('column "monto_base" of relation "contratos" already exists')) {
        console.log('Column "monto_base" already exists, skipping.');
      } else {
        throw error;
      }
    }

    return NextResponse.json({ message: 'Migration completed successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

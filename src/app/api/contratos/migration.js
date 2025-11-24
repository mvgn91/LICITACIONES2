const { sql } = require('@vercel/postgres');

async function addColumns() {
  try {
    await sql`ALTER TABLE contratos ADD COLUMN fecha_inicio DATE;`;
    console.log('Column "fecha_inicio" added successfully.');
  } catch (error) {
    if ((error).message.includes('column "fecha_inicio" of relation "contratos" already exists')) {
      console.log('Column "fecha_inicio" already exists, skipping.');
    } else {
      console.error('Error adding column "fecha_inicio":', error);
    }
  }

  try {
    await sql`ALTER TABLE contratos ADD COLUMN monto_base NUMERIC;`;
    console.log('Column "monto_base" added successfully.');
  } catch (error) {
    if ((error).message.includes('column "monto_base" of relation "contratos" already exists')) {
      console.log('Column "monto_base" already exists, skipping.');
    } else {
      console.error('Error adding column "monto_base":', error);
    }
  }
}

addColumns();

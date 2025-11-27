
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET all contracts - Updated to join with the new Clientes table
export async function GET() {
  let client;
  try {
    client = await db.connect();
    // Joins Contratos with Clientes to get the client name
    const result = await client.sql`
      SELECT c.*, cl.name as cliente_nombre
      FROM contratos c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      ORDER BY c.fecha_inicio DESC;
    `;
    return NextResponse.json({ contratos: result.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// POST a new contract - Rewritten for the new schema with defaults
export async function POST(request: Request) {
  let client;
  try {
    client = await db.connect();
    const {
      cliente_nombre, // Expecting the name of the client
      nombre,
      monto_total,
      fecha_inicio,
      fecha_fin
      // Other fields will use database defaults
    } = await request.json();

    // Basic validation
    if (!cliente_nombre || !nombre || !monto_total) {
      return NextResponse.json({ error: 'cliente_nombre, nombre, and monto_total are required' }, { status: 400 });
    }

    await client.sql`BEGIN`;

    // Find or create the client
    let clienteResult = await client.sql`SELECT id FROM clientes WHERE name = ${cliente_nombre}`;
    let cliente_id;

    if (clienteResult.rowCount === 0) {
      // Create a new client and get its ID
      const newClienteResult = await client.sql`INSERT INTO clientes (name) VALUES (${cliente_nombre}) RETURNING id;`;
      cliente_id = newClienteResult.rows[0].id;
    } else {
      cliente_id = clienteResult.rows[0].id;
    }

    // Insert the new contract referencing the client_id
    const newContractResult = await client.sql`
      INSERT INTO contratos (cliente_id, nombre, monto_total, fecha_inicio, fecha_fin)
      VALUES (${cliente_id}, ${nombre}, ${monto_total}, ${fecha_inicio}, ${fecha_fin})
      RETURNING *;
    `;

    // Fetch the newly created contract with the client name for the response
    const finalContractResult = await client.sql`
        SELECT c.*, cl.name as cliente_nombre
        FROM contratos c
        JOIN clientes cl ON c.cliente_id = cl.id
        WHERE c.id = ${newContractResult.rows[0].id};
    `;

    await client.sql`COMMIT`;

    return NextResponse.json({ contrato: finalContractResult.rows[0] }, { status: 201 });

  } catch (error) {
    if (client) {
      await client.sql`ROLLBACK`;
    }
    console.error('Error creating contract:', error);
    // Provide a more specific error message if possible
    return NextResponse.json({ error: `Failed to create contract: ${(error as Error).message}` }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

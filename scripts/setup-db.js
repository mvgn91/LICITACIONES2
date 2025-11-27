require('dotenv').config();
const { db } = require('@vercel/postgres');
const { randomUUID } = require('crypto');

// Original data has numeric, mismatched IDs. We'''ll load it and transform it.
const { contratos: rawContratos, estimaciones: rawEstimaciones } = require('../src/lib/placeholder-data.js');

// 1. Create Clientes with UUIDs
const clienteNames = [...new Set(rawContratos.map((c) => c.cliente))];
const clientes = clienteNames.map((name) => ({
  id: randomUUID(),
  name,
}));
const clienteNameToIdMap = new Map(clientes.map((c) => [c.name, c.id]));

// 2. Create Contratos with UUIDs and correct foreign keys
const oldContratoIdToNewUuidMap = new Map();
const contratos = rawContratos.map((rawContrato) => {
  const newId = randomUUID();
  oldContratoIdToNewUuidMap.set(rawContrato.id, newId);
  return {
    id: newId,
    cliente_id: clienteNameToIdMap.get(rawContrato.cliente),
    nombre: rawContrato.nombre,
    numero_contrato: rawContrato.numero_contrato || null,
    fecha_inicio: rawContrato.fechaInicio,
    fecha_fin: rawContrato.fechaTerminoEstimada,
    monto_total: rawContrato.montoConIVA,
    estado: rawContrato.estado,
    objeto: rawContrato.objeto || null,
    localizacion: rawContrato.localizacion || null,
    amortizacion: rawContrato.amortizacion || null
  };
});

// 3. Create Estimaciones with UUIDs and correct foreign keys
const estimaciones = rawEstimaciones.map((rawEstimacion) => {
  return {
    id: randomUUID(),
    contrato_id: oldContratoIdToNewUuidMap.get(rawEstimacion.contratoId),
    numero_estimacion: rawEstimacion.numero,
    monto: rawEstimacion.monto,
    fecha: rawEstimacion.fecha,
    estado: rawEstimacion.estado,
    documentos: rawEstimacion.documentos || null
  };
});


async function seedClientes(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "clientes" table if it doesn'''t exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `;

    console.log(`Created "clientes" table`);

    // Insert data into the "clientes" table
    const insertedClientes = await Promise.all(
      clientes.map(async (cliente) => {
        return client.sql`
        INSERT INTO clientes (id, name)
        VALUES (${cliente.id}, ${cliente.name})
        ON CONFLICT (id) DO NOTHING;
      `;
      }),
    );

    console.log(`Seeded ${insertedClientes.length} clientes`);

    return {
      createTable,
      clientes: insertedClientes,
    };
  } catch (error) {
    console.error('Error seeding clientes:', error);
    throw error;
  }
}

async function seedContratos(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "contratos" table if it doesn'''t exist
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS contratos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    numero_contrato VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    monto_total REAL,
    estado VARCHAR(50),
    objeto TEXT,
    localizacion TEXT,
    amortizacion REAL
  );
`;

    console.log(`Created "contratos" table`);

    // Insert data into the "contratos" table
    const insertedContratos = await Promise.all(
      contratos.map(
        (contrato) => client.sql`
        INSERT INTO contratos (id, cliente_id, nombre, numero_contrato, fecha_inicio, fecha_fin, monto_total, estado, objeto, localizacion, amortizacion)
        VALUES (${contrato.id}, ${contrato.cliente_id}, ${contrato.nombre}, ${contrato.numero_contrato}, ${contrato.fecha_inicio}, ${contrato.fecha_fin}, ${contrato.monto_total}, ${contrato.estado}, ${contrato.objeto}, ${contrato.localizacion}, ${contrato.amortizacion})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedContratos.length} contratos`);

    return {
      createTable,
      contratos: insertedContratos,
    };
  } catch (error) {
    console.error('Error seeding contratos:', error);
    throw error;
  }
}

async function seedEstimaciones(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "estimaciones" table if it doesn'''t exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS estimaciones (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        contrato_id UUID NOT NULL,
        numero_estimacion VARCHAR(255) NOT NULL,
        monto REAL NOT NULL,
        fecha DATE NOT NULL,
        estado VARCHAR(50) NOT NULL,
        documentos JSONB
      );
    `;

    console.log(`Created "estimaciones" table`);

    // Insert data into the "estimaciones" table
    const insertedEstimaciones = await Promise.all(
      estimaciones.map(
        (estimacion) => client.sql`
        INSERT INTO estimaciones (id, contrato_id, numero_estimacion, monto, fecha, estado, documentos)
        VALUES (${estimacion.id}, ${estimacion.contrato_id}, ${estimacion.numero_estimacion}, ${estimacion.monto}, ${estimacion.fecha}, ${estimacion.estado}, ${estimacion.documentos})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedEstimaciones.length} estimaciones`);

    return {
      createTable,
      estimaciones: insertedEstimaciones,
    };
  } catch (error) {
    console.error('Error seeding estimaciones:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();
  
  // Drop tables in reverse order of creation to avoid foreign key conflicts
  console.log('Dropping existing tables for a clean seed...');
  await client.sql`DROP TABLE IF EXISTS estimaciones;`;
  await client.sql`DROP TABLE IF EXISTS contratos;`;
  await client.sql`DROP TABLE IF EXISTS clientes;`;
  console.log('Tables dropped successfully.');

  await seedClientes(client);
  await seedContratos(client);
  await seedEstimaciones(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});

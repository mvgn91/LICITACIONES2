import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Suponiendo que tus tipos están en `@/lib/types`
import type { Estimacion } from '@/lib/types';

/**
 * POST handler para agregar una nueva estimación a un contrato.
 * Asume que los archivos se subirán a un directorio `uploads` en el directorio público.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: contractId } = params;

  if (!contractId) {
    return NextResponse.json({ error: 'ID de contrato no proporcionado' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const monto = formData.get('monto');
    const observaciones = formData.get('observaciones');
    const files = formData.getAll('evidencias') as File[];

    // 1. Validación básica de datos
    if (!monto || !observaciones) {
        return NextResponse.json({ error: 'Monto y observaciones son requeridos' }, { status: 400 });
    }

    const montoNumber = Number(monto);
    if (isNaN(montoNumber) || montoNumber <= 0) {
        return NextResponse.json({ error: 'Monto inválido.' }, { status: 400 });
    }

    // 2. Lógica para manejar la subida de archivos
    const uploadedFilePaths: string[] = [];
    if (files.length > 0) {
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await fs.mkdir(uploadDir, { recursive: true }); // Asegura que el directorio exista

        for (const file of files) {
            if(file.size === 0) continue;

            const buffer = Buffer.from(await file.arrayBuffer());
            const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const uploadPath = path.join(uploadDir, uniqueFilename);

            await fs.writeFile(uploadPath, buffer);
            uploadedFilePaths.push(`/uploads/${uniqueFilename}`); // Ruta pública para acceder al archivo
        }
    }

    // 3. Simulación de guardado en base de datos
    // En una aplicación real, aquí interactuarías con tu base de datos (e.g., Prisma, Drizzle, etc.)
    // para agregar la estimación al contrato con `contractId`.
    const newEstimacion: Estimacion = {
      id: `est_${Date.now()}`,
      monto: montoNumber,
      observaciones: observaciones.toString(),
      evidencias: uploadedFilePaths, // Guardas las rutas de los archivos
      createdAt: Date.now(),
      tipo: 'Parcial', // O el tipo que corresponda
      ocRecibida: false,
    };

    console.log(`Simulando guardado en DB para contrato ${contractId}:`, newEstimacion);

    // 4. Retornar la nueva estimación creada
    return NextResponse.json(newEstimacion, { status: 201 });

  } catch (error) {
    console.error('Error al procesar la estimación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

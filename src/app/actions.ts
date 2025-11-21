
'use server';

import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Zod schema for validating contract form data
const contractFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre del proyecto es requerido'),
  cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  montoConIVA: z.coerce.number().min(0, 'El monto debe ser un número positivo'),
  fechaInicio: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "La fecha de inicio es inválida" }),
  fechaTerminoEstimada: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "La fecha de término es inválida" }),
});

export async function addContract(prevState: any, formData: FormData) {

  const values = {
    nombre: formData.get('nombre'),
    cliente: formData.get('cliente'),
    montoConIVA: formData.get('montoConIVA'),
    fechaInicio: formData.get('fechaInicio'),
    fechaTerminoEstimada: formData.get('fechaTerminoEstimada'),
  }

  const validatedFields = contractFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      message: 'Datos de formulario inválidos. Por favor, revise sus entradas.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { fechaInicio, fechaTerminoEstimada, ...rest } = validatedFields.data;
    
  const newContractData = {
    ...rest,
    fechaInicio: Timestamp.fromDate(new Date(fechaInicio)),
    fechaTerminoEstimada: Timestamp.fromDate(new Date(fechaTerminoEstimada)),
    createdAt: serverTimestamp(),
    estado: 'Activo' as const,
    montoBase: 0,
    montoSinIVA: 0,
    descripcion: '',
    docConstructoraOK: false,
    docControlOK: false,
  };

  try {
    const docRef = await addDoc(collection(db, 'contratos'), newContractData);
    revalidatePath('/');
    return { message: `Contrato agregado exitosamente con ID: ${docRef.id}.`, errors: null };
  } catch (e: any) {
    // This is a server action, so we can't directly emit.
    // We will return a specific error shape that the client can interpret.
    // For now, we'll log and return a generic server error.
    // The client-side calls will be updated to use the emitter.
    console.error('Error al crear contrato:', e);
    // Let's assume for now server actions can't use the emitter and we'll focus on client-side first.
     return { message: 'Error al crear el contrato.', errors: { server: [e.message] } };
  }
}

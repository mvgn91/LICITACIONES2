
'use server';

import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase'; // Changed import
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Zod schema for validating contract form data
const contractFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre del proyecto es requerido'),
  cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  montoConIVA: z.coerce.number().min(0, 'El monto debe ser un número positivo'),
  fechaInicio: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "La fecha de inicio es inválida" }),
  fechaTerminoEstimada: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "La fecha de término es inválida" }),
  userId: z.string(),
});

export async function addContract(prevState: any, formData: FormData) {

  const values = {
    nombre: formData.get('nombre'),
    cliente: formData.get('cliente'),
    montoConIVA: formData.get('montoConIVA'),
    fechaInicio: formData.get('fechaInicio'),
    fechaTerminoEstimada: formData.get('fechaTerminoEstimada'),
    userId: formData.get('userId'),
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

    const contractsCollection = collection(firestore, 'contratos');
    // Using the non-blocking add function now
    addDocumentNonBlocking(contractsCollection, newContractData);

    revalidatePath('/');
    return { message: `El contrato se está agregando.`, errors: null };
}

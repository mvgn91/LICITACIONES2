
'use server';

import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase';

// Zod schema for validating contract form data
const contractFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre del proyecto es requerido'),
  cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  montoConIVA: z.coerce.number().min(0, 'El monto debe ser un número positivo'),
  // Coerce date strings or other values to Date objects
  fechaInicio: z.coerce.date({ required_error: 'La fecha de inicio es requerida' }),
  fechaTerminoEstimada: z.coerce.date({ required_error: 'La fecha de término estimada es requerida' }),
});

// Infer the type from the schema to use as the function parameter type
type ContractFormData = z.infer<typeof contractFormSchema>;

export async function addContract(prevState: any, formData: FormData) {

  const values = {
    nombre: formData.get('nombre'),
    cliente: formData.get('cliente'),
    montoConIVA: formData.get('montoConIVA'),
    fechaInicio: formData.get('fechaInicio'),
    fechaTerminoEstimada: formData.get('fechaTerminoEstimada'),
  }

  // Validate the incoming data against the schema
  const validatedFields = contractFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      message: 'Datos de formulario inválidos. Por favor, revise sus entradas.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { fechaInicio, fechaTerminoEstimada, ...rest } = validatedFields.data;
    
    // Prepare the full contract document for Firestore
    const newContractData = {
      ...rest,
      // Convert Date objects to Firestore Timestamps
      fechaInicio: Timestamp.fromDate(fechaInicio),
      fechaTerminoEstimada: Timestamp.fromDate(fechaTerminoEstimada),
      // Set server-side timestamp for creation date
      createdAt: serverTimestamp(),
      // Set default values for fields not present in the form
      estado: 'Activo' as const,
      montoBase: 0, // Default value
      montoSinIVA: 0, // Default value
      descripcion: '', // Default value
      docConstructoraOK: false,
      docControlOK: false,
      // Optional fields will be implicitly undefined, which is fine for Firestore
    };

    await addDoc(collection(db, 'contratos'), newContractData);

    // Revalidate the cache for the home page to show the new contract
    revalidatePath('/');
    
    return { message: 'Contrato agregado exitosamente.', errors: null };

  } catch (e) {
    console.error('Error al crear contrato:', e);
    return { message: 'Error al crear el contrato.', errors: { server: ['An unexpected error occurred.'] } };
  }
}

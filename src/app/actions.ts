'use server';

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import {calculateContractProgress} from "@/ai/flows/calculate-contract-progress";

const contractSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  totalAmount: z.coerce.number().min(0, 'Total amount must be positive'),
  contractDate: z.date(),
});

export async function addContract(prevState: any, formData: FormData) {
  const validatedFields = contractSchema.safeParse({
    clientName: formData.get('clientName'),
    address: formData.get('address'),
    phone: formData.get('phone'),
    totalAmount: formData.get('totalAmount'),
    contractDate: new Date(formData.get('contractDate') as string),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const { contractDate, ...rest } = validatedFields.data;
    await addDoc(collection(db, 'contracts'), {
      ...rest,
      contractDate: Timestamp.fromDate(contractDate),
    });

    revalidatePath('/');
    return { message: 'Contract added successfully.' };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to create contract.' };
  }
}

const estimationSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  file: z.instanceof(File).optional(),
});

export async function addEstimation(contractId: string, prevState: any, formData: FormData) {
    if (!contractId) return { message: 'Contract ID is missing.' };

    const validatedFields = estimationSchema.safeParse({
        description: formData.get('description'),
        amount: formData.get('amount'),
        file: formData.get('file'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { file, ...estimationData } = validatedFields.data;
    let fileUrl = '';

    try {
        if (file && file.size > 0) {
            const storageRef = ref(storage, `evidencias/${contractId}/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            fileUrl = await getDownloadURL(snapshot.ref);
        }

        await addDoc(collection(db, `contracts/${contractId}/estimations`), {
            ...estimationData,
            isCompleted: false,
            evidencias: fileUrl ? [fileUrl] : [],
        });
        
        revalidatePath(`/contracts/${contractId}`);
        revalidatePath('/');
        return { message: 'Estimation added successfully.' };

    } catch (e) {
        console.error(e);
        return { message: 'Failed to add estimation.' };
    }
}


export async function updateEstimationStatus(contractId: string, estimationId: string, isCompleted: boolean) {
  if (!contractId || !estimationId) {
    throw new Error('Contract or Estimation ID is missing.');
  }
  try {
    const estimationRef = doc(db, `contracts/${contractId}/estimations`, estimationId);
    await updateDoc(estimationRef, {
      isCompleted: isCompleted,
    });
    revalidatePath(`/contracts/${contractId}`);
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to update estimation status:', error);
    throw new Error('Failed to update estimation status.');
  }
}

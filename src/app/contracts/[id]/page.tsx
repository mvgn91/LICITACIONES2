
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import type { Contract, Estimation } from '@/lib/types';
import { ContractDetails } from '@/components/contracts/ContractDetails';
import { Timestamp } from 'firebase/firestore';

interface PageProps {
  params: {
    id: string;
  };
}

async function getContract(id: string): Promise<any | null> {
  const contractRef = doc(db, 'contratos', id);
  const contractSnap = await getDoc(contractRef);

  if (!contractSnap.exists()) {
    return null;
  }

  const contractData = contractSnap.data() as Omit<Contract, 'id' | 'estimations' | 'progress'>;

  const estimationsCol = query(collection(db, `contratos/${id}/estimaciones`));
  const estimationSnapshot = await getDocs(estimationsCol);
  const estimations = estimationSnapshot.docs.map(
    (estDoc) => ({ id: estDoc.id, ...estDoc.data() } as Estimation)
  );

  return {
    id: contractSnap.id,
    ...contractData,
    fechaInicio: (contractData.fechaInicio as Timestamp).toMillis(),
    fechaTerminoEstimada: (contractData.fechaTerminoEstimada as Timestamp).toMillis(),
    createdAt: (contractData.createdAt as Timestamp).toMillis(),
    anticipoFecha: contractData.anticipoFecha ? (contractData.anticipoFecha as Timestamp).toMillis() : null,
    estimations: estimations.map(est => ({
      ...est,
      createdAt: (est.createdAt as Timestamp).toMillis(),
    })),
    progress: 0, // Progress will be calculated client-side in real-time
  };
}

export default async function ContractPage({ params }: PageProps) {
  const contract = await getContract(params.id);

  if (!contract) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <ContractDetails initialContract={contract} />
    </div>
  );
}

export const revalidate = 0; // Make this page dynamic


import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contrato } from '@/lib/types';
import { ContractList } from '@/components/contracts/ContractList';
import { EmptyState } from '@/components/contracts/EmptyState';
import { Timestamp } from 'firebase/firestore';

async function getContracts(): Promise<any[]> {
  // Firestore query for the 'contratos' collection, ordered by creation date
  const contratosCol = query(collection(db, 'contratos'), orderBy('createdAt', 'desc'));
  const contratoSnapshot = await getDocs(contratosCol);
  const contratos: any[] = [];

  for (const doc of contratoSnapshot.docs) {
    // Basic contract data, assuming it matches the Contrato interface excluding subcollections
    const contractData = doc.data() as Omit<Contrato, 'id'>;

    const contrato = {
      id: doc.id,
      ...contractData,
      // Convert Timestamps to ensure serializability for the client component
      fechaInicio: (contractData.fechaInicio as Timestamp).toMillis(),
      fechaTerminoEstimada: (contractData.fechaTerminoEstimada as Timestamp).toMillis(),
      createdAt: (contractData.createdAt as Timestamp).toMillis(),
      anticipoFecha: contractData.anticipoFecha ? (contractData.anticipoFecha as Timestamp).toMillis() : null,
    };

    contratos.push(contrato);
  }

  return contratos;
}

export default async function Page() {
  let initialContracts: any[] = [];
  try {
    initialContracts = await getContracts();
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    // Render an empty state with an error message or a more specific error component
    return <EmptyState error="No se pudieron cargar los contratos. Verifique la configuración de Firestore y las reglas de seguridad." />;
  }

  if (!initialContracts || initialContracts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Contratos</h1>
      <ContractList initialContracts={initialContracts} />
    </div>
  );
}

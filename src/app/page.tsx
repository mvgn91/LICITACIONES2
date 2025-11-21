import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contract, Estimation } from '@/lib/types';
import { ContractList } from '@/components/contracts/ContractList';
import { calculateContractProgress } from '@/ai/flows/calculate-contract-progress';
import { EmptyState } from '@/components/contracts/EmptyState';
import { Timestamp } from 'firebase/firestore';

async function getContracts(): Promise<any[]> {
  // Ensure you have a composite index in Firestore for this query:
  // Collection: contracts, Fields: contractDate (descending)
  const contractsCol = query(collection(db, 'contracts'), orderBy('contractDate', 'desc'));
  const contractSnapshot = await getDocs(contractsCol);
  const contracts: any[] = [];

  for (const doc of contractSnapshot.docs) {
    const contractData = doc.data() as Omit<Contract, 'id' | 'estimations' | 'progress'>;

    const estimationsCol = query(collection(db, `contracts/${doc.id}/estimations`));
    const estimationSnapshot = await getDocs(estimationsCol);
    const estimations = estimationSnapshot.docs.map(
      (estDoc) => ({ id: estDoc.id, ...estDoc.data() } as Estimation)
    );

    let progress = 0;
    if (estimations.length > 0) {
      try {
        const result = await calculateContractProgress({ estimations });
        progress = Math.round(result.progress);
      } catch (error) {
        console.error('Error calculating progress for contract', doc.id, error);
        const completed = estimations.filter((e) => e.isCompleted).length;
        progress = estimations.length > 0 ? Math.round((completed / estimations.length) * 100) : 0;
      }
    }

    const contract = {
      id: doc.id,
      ...contractData,
      contractDate: (contractData.contractDate as Timestamp).toMillis(),
      estimations,
      progress,
    };

    contracts.push(contract);
  }

  return contracts;
}

export default async function Page() {
  const initialContracts = await getContracts();

  if (!initialContracts || initialContracts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <ContractList initialContracts={initialContracts} />
    </div>
  );
}

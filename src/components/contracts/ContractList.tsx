
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contrato } from '@/lib/types';
import { ContractCard } from './ContractCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ContractListProps {
  initialContracts: any[];
}

export function ContractList({ initialContracts }: ContractListProps) {
  const [contracts, setContracts] = useState<any[]>(initialContracts);
  const [loading, setLoading] = useState(initialContracts.length === 0);

  useEffect(() => {
    const q = query(collection(db, 'contratos'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serverContracts: any[] = [];
      snapshot.forEach((doc) => {
          const data = doc.data();
          serverContracts.push({
              id: doc.id,
              ...data,
              fechaInicio: (data.fechaInicio as Timestamp).toMillis(),
              fechaTerminoEstimada: (data.fechaTerminoEstimada as Timestamp).toMillis(),
              createdAt: (data.createdAt as Timestamp).toMillis(),
              anticipoFecha: data.anticipoFecha ? (data.anticipoFecha as Timestamp).toMillis() : null,
          });
      });
      
      setContracts(serverContracts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 rounded-lg border bg-card p-6">
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <div className="flex-grow pt-4 space-y-4">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
            </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {contracts.map((contract) => (
        <ContractCard key={contract.id} contract={contract} progress={0} />
      ))}
    </div>
  );
}

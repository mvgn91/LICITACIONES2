
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Contrato } from '@/lib/types';
import { ContractCard } from './ContractCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './EmptyState';

interface ContractListProps {
  userId: string;
}

export function ContractList({ userId }: ContractListProps) {
  const firestore = useFirestore();

  const contractsQuery = useMemoFirebase(
    () => {
      if (!firestore || !userId) return null;
      return query(
        collection(firestore, 'contratos'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    },
    [firestore, userId]
  );
  
  const { data: contracts, isLoading } = useCollection<Contrato>(contractsQuery);

  if (isLoading) {
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
  
  if (!contracts || contracts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {contracts.map((contract) => (
        <ContractCard key={contract.id} contract={contract} />
      ))}
    </div>
  );
}

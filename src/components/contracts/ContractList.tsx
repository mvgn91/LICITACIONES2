
'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contract, Estimation } from '@/lib/types';
import { ContractCard } from './ContractCard';
import { calculateContractProgress } from '@/ai/flows/calculate-contract-progress';
import { Skeleton } from '@/components/ui/skeleton';

interface ContractListProps {
  initialContracts: Contract[];
}

export function ContractList({ initialContracts }: ContractListProps) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [loading, setLoading] = useState(true);
  const estimationListeners = useRef<Record<string, () => void>>({});

  useEffect(() => {
    const q = query(collection(db, 'contracts'), orderBy('contractDate', 'desc'));

    const contractsUnsubscribe = onSnapshot(q, (snapshot) => {
      // Use initial server-rendered data on first load
      if (loading && contracts.length > 0) {
        setLoading(false);
      }

      const currentContracts = [...contracts];

      snapshot.docChanges().forEach((change) => {
        const doc = change.doc;
        const contractId = doc.id;

        if (change.type === 'added' && !currentContracts.some(c => c.id === contractId)) {
          if (estimationListeners.current[contractId]) return;

          const estimationsQuery = collection(db, 'contracts', contractId, 'estimations');
          const estUnsubscribe = onSnapshot(estimationsQuery, async (estimationsSnapshot) => {
            const estimations = estimationsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Estimation));
            
            let progress = 0;
            if (estimations.length > 0) {
              try {
                const result = await calculateContractProgress({ estimations });
                progress = Math.round(result.progress);
              } catch (error) {
                console.error("Error calculating progress", error);
                const completed = estimations.filter(e => e.isCompleted).length;
                progress = estimations.length > 0 ? Math.round((completed / estimations.length) * 100) : 0;
              }
            }
            
            const newContract: Contract = {
                id: contractId,
                ...doc.data(),
                estimations,
                progress
            } as Contract;
            
            setContracts(prev => {
                const index = prev.findIndex(c => c.id === contractId);
                if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = newContract;
                    return updated.sort((a,b) => b.contractDate.toMillis() - a.contractDate.toMillis());
                }
                return [...prev, newContract].sort((a,b) => b.contractDate.toMillis() - a.contractDate.toMillis());
            });
          });

          estimationListeners.current[contractId] = estUnsubscribe;
        }

        if (change.type === 'modified') {
          setContracts(prev => {
            const index = prev.findIndex(c => c.id === contractId);
            if (index !== -1) {
                const updated = [...prev];
                // Only update contract-level fields, progress is handled by estimation listener
                updated[index] = { ...updated[index], ...doc.data() };
                return updated.sort((a,b) => b.contractDate.toMillis() - a.contractDate.toMillis());
            }
            return prev;
          });
        }

        if (change.type === 'removed') {
          if (estimationListeners.current[contractId]) {
              estimationListeners.current[contractId]();
              delete estimationListeners.current[contractId];
          }
          setContracts(prev => prev.filter(c => c.id !== contractId));
        }
      });
      
      if (snapshot.empty) {
        setContracts([]);
      }
      setLoading(false);
    });

    return () => {
        contractsUnsubscribe();
        Object.values(estimationListeners.current).forEach(unsub => unsub());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(initialContracts.length || 3)].map((_, i) => (
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
        <ContractCard key={contract.id} contract={contract} />
      ))}
    </div>
  );
}

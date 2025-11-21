'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

import type { Contract, Estimation } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { calculateContractProgress } from '@/ai/flows/calculate-contract-progress';
import { EstimationList } from './EstimationList';
import { AddEstimationModal } from './AddEstimationModal';

interface ContractDetailsProps {
  initialContract: Contract;
}

export function ContractDetails({ initialContract }: ContractDetailsProps) {
  const [contract, setContract] = useState<Contract>(initialContract);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubContract = onSnapshot(doc(db, 'contracts', initialContract.id), (doc) => {
      if (doc.exists()) {
        setContract(prev => ({ ...prev, ...doc.data() }));
      }
    });

    const q = query(collection(db, `contracts/${initialContract.id}/estimations`));
    const unsubEstimations = onSnapshot(q, async (snapshot) => {
        const estimations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimation));
        setContract(prev => ({ ...prev, estimations }));

        if (estimations.length > 0) {
            try {
                const result = await calculateContractProgress({ estimations });
                setProgress(Math.round(result.progress));
            } catch (error) {
                console.error("Progress calculation failed", error);
                const completed = estimations.filter(e => e.isCompleted).length;
                setProgress(estimations.length > 0 ? Math.round((completed / estimations.length) * 100) : 0);
            }
        } else {
            setProgress(0);
        }
    });

    // Initial calculation
    (async () => {
        if (initialContract.estimations.length > 0) {
            const result = await calculateContractProgress({ estimations: initialContract.estimations });
            setProgress(Math.round(result.progress));
        }
    })();


    return () => {
      unsubContract();
      unsubEstimations();
    };
  }, [initialContract.id, initialContract.estimations]);

  const progressColor = useMemo(() => progress < 100 ? 'bg-accent' : 'bg-green-500', [progress]);

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{contract.clientName}</CardTitle>
          <div className="flex w-full justify-between items-center text-sm text-muted-foreground pt-2">
            <span>Overall Progress</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className={`h-2 [&>div]:${progressColor}`} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Users className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{contract.clientName}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
              <span>{contract.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
              <span>{contract.phone}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
              <span>{format(contract.contractDate.toDate(), 'PPP')}</span>
            </div>
            <div className="flex items-center col-span-1 md:col-span-2">
              <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(contract.totalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="font-headline text-2xl">Estimations</CardTitle>
                <CardDescription>
                Manage tasks and track their completion.
                </CardDescription>
            </div>
            <AddEstimationModal contractId={contract.id} />
        </CardHeader>
        <CardContent>
            <EstimationList contractId={contract.id} estimations={contract.estimations} />
        </CardContent>
      </Card>
    </div>
  );
}

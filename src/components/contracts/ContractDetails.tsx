
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, collection, query, Timestamp } from 'firebase/firestore';
import {
  Users,
  Calendar,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

import type { Contrato } from '@/lib/types';
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
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

interface ContractDetailsProps {
  contractId: string;
}

export function ContractDetails({ contractId }: ContractDetailsProps) {
  const [progress, setProgress] = useState(0);
  const firestore = useFirestore();

  const contractRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'contratos', contractId);
  }, [firestore, contractId]);

  const { data: contract, isLoading: isContractLoading } = useDoc<Contrato>(contractRef);

  const estimationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `contratos/${contractId}/estimaciones`));
  }, [firestore, contractId]);
  
  const { data: estimations, isLoading: areEstimationsLoading } = useCollection(estimationsQuery);

  useEffect(() => {
    const updateProgress = async () => {
      if (estimations) {
        if (estimations.length > 0) {
          const flowInput = estimations.map(e => ({ isCompleted: !!e.isCompleted }));
          const result = await calculateContractProgress({ estimations: flowInput });
          setProgress(Math.round(result.progress));
        } else {
          setProgress(0);
        }
      }
    };
    updateProgress();
  }, [estimations]);
  
  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) { // It's a Firestore Timestamp
      return format(timestamp.toDate(), 'PPP', { locale: es });
    }
    return format(new Date(timestamp), 'PPP', { locale: es });
  };

  const progressColor = useMemo(() => progress < 100 ? 'bg-accent' : 'bg-green-500', [progress]);
  
  if (isContractLoading) {
     return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-40" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/4" />
            <div className="pt-2">
              <Skeleton className="h-2 w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contract) {
    return <div>Contrato no encontrado.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Contratos
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{contract.nombre}</CardTitle>
           <CardDescription className="flex items-center pt-1">
            <Users className="mr-2 h-4 w-4" />
            <span>{contract.cliente}</span>
          </CardDescription>
          <div className="flex w-full justify-between items-center text-sm text-muted-foreground pt-2">
            <span>Progreso General</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className={`h-2 [&>div]:${progressColor}`} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
              <span>Inicio: {getFormattedDate(contract.fechaInicio)}</span>
            </div>
             <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
              <span>Término: {getFormattedDate(contract.fechaTerminoEstimada)}</span>
            </div>
            <div className="flex items-center col-span-1 md:col-span-2">
              <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(contract.montoConIVA)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="font-headline text-2xl">Estimaciones</CardTitle>
                <CardDescription>
                Administra las tareas y sigue su progreso.
                </CardDescription>
            </div>
            <AddEstimationModal contractId={contract.id} />
        </CardHeader>
        <CardContent>
            <EstimationList contractId={contract.id} estimations={estimations || []} isLoading={areEstimationsLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

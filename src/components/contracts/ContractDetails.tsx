
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, collection, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users,
  Calendar,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

import type { Contrato, Estimacion } from '@/lib/types';
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
  initialContract: any;
}

export function ContractDetails({ initialContract }: ContractDetailsProps) {
  const [contract, setContract] = useState<any>(initialContract);
  const [estimations, setEstimations] = useState<any[]>(initialContract.estimations || []);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubContract = onSnapshot(doc(db, 'contratos', initialContract.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setContract({
            ...data,
            id: doc.id,
            fechaInicio: (data.fechaInicio as Timestamp).toMillis(),
            fechaTerminoEstimada: (data.fechaTerminoEstimada as Timestamp).toMillis(),
            createdAt: (data.createdAt as Timestamp).toMillis(),
            anticipoFecha: data.anticipoFecha ? (data.anticipoFecha as Timestamp).toMillis() : null
        });
      }
    });

    const q = query(collection(db, `contratos/${initialContract.id}/estimaciones`));
    const unsubEstimations = onSnapshot(q, async (snapshot) => {
        const ests = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toMillis()
            }
        });
        setEstimations(ests);

        if (ests.length > 0) {
            try {
                // The AI flow expects a boolean `isCompleted`, ensure your data has it.
                const flowInput = ests.map(e => ({ isCompleted: !!e.isCompleted }));
                const result = await calculateContractProgress({ estimations: flowInput });
                setProgress(Math.round(result.progress));
            } catch (error) {
                console.error("Progress calculation failed", error);
                const completed = ests.filter(e => e.isCompleted).length;
                setProgress(ests.length > 0 ? Math.round((completed / ests.length) * 100) : 0);
            }
        } else {
            setProgress(0);
        }
    });

    // Initial calculation
    (async () => {
        if (initialContract.estimations.length > 0) {
            const flowInput = initialContract.estimations.map((e: any) => ({ isCompleted: !!e.isCompleted }));
            const result = await calculateContractProgress({ estimations: flowInput });
            setProgress(Math.round(result.progress));
        }
    })();


    return () => {
      unsubContract();
      unsubEstimations();
    };
  }, [initialContract.id, initialContract.estimations]);
  
  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp), 'PPP', { locale: es });
  };

  const progressColor = useMemo(() => progress < 100 ? 'bg-accent' : 'bg-green-500', [progress]);

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
            <EstimationList contractId={contract.id} estimations={estimations} />
        </CardContent>
      </Card>
    </div>
  );
}

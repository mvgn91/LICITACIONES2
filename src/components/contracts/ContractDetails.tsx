'use client';

import { useMemo } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EstimationList } from './EstimationList';
import { AddEstimationModal } from './AddEstimationModal';
import type { Contrato, Estimacion } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { mockContratos } from '@/lib/mock-data';

interface ContractDetailsProps {
  contractId: string;
}

export function ContractDetails({ contractId }: ContractDetailsProps) {
  const isLoading = false;
  
  const contract = useMemo(
    () => mockContratos.find(c => c.id === contractId),
    [contractId]
  );
  
  const estimations = contract?.estimaciones || [];

  const calculateProgress = () => {
    if (!contract || !estimations || estimations.length === 0) {
      return 0;
    }
    const totalMonto = contract.montoConIVA;
    const montoEstimado = estimations.reduce((acc: number, est: any) => acc + est.monto, 0);
    
    if (totalMonto === 0) return 0;
    
    return Math.round((montoEstimado / totalMonto) * 100);
  };
  
  const progress = useMemo(calculateProgress, [contract, estimations]);
  const progressColor = useMemo(() => progress < 100 ? 'bg-accent' : 'bg-green-500', [progress]);
  
  if (isLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-48 mb-4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
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
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!contract) {
    return <div>Contrato no encontrado.</div>
  }

  const typedContract = contract as Contrato;

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
          <CardTitle className="font-headline text-3xl">{typedContract.nombre}</CardTitle>
           <CardDescription className="flex items-center pt-1">
            <Users className="mr-2 h-4 w-4" />
            <span>{typedContract.cliente}</span>
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
              <span>Inicio: {formatDate(typedContract.fechaInicio)}</span>
            </div>
             <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
              <span>Término: {formatDate(typedContract.fechaTerminoEstimada)}</span>
            </div>
            <div className="flex items-center col-span-1 md:col-span-2">
              <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(typedContract.montoConIVA)}
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
            <AddEstimationModal contractId={typedContract.id} />
        </CardHeader>
        <CardContent>
            <EstimationList contractId={typedContract.id} estimations={estimations as Estimacion[]} />
        </CardContent>
      </Card>
    </div>
  );
}

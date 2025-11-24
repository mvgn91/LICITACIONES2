
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, FileText, Users, DollarSign, Building, Banknote, Landmark, Percent, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import type { Contrato, Estimacion, Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EditContractModal } from './EditContractModal';
// TODO: Re-implementar estas funcionalidades conectadas a la API
// import { EstimationList } from './EstimationList';
// import { AddEstimationModal } from './AddEstimationModal';
// import { PaymentHistory } from './PaymentHistory';

export function ContractDetails() {
  const { id: contractId } = useParams();
  const { toast } = useToast();

  const [contract, setContract] = useState<Contrato | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchContract = useCallback(async () => {
    if (!contractId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/contratos/${contractId}`);
      if (!response.ok) {
        throw new Error('Contrato no encontrado');
      }
      const data = await response.json();
      setContract(data.contrato);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo cargar el contrato.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [contractId, toast]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleUpdateContract = (updatedContract: Contrato) => {
    setContract(updatedContract);
  };

  // Valores calculados basados en el contrato
  const {
    progress, 
    remainingBalance, 
    receivedPayments,
    isFinalizado,
  } = useMemo(() => {
    if (!contract) return { progress: 0, remainingBalance: 0, receivedPayments: 0, isFinalizado: false };
    
    // TODO: Las estimaciones deben venir de la API
    const estimations: Estimacion[] = []; // Reemplazar con datos reales
    const anticipo = contract.anticipoMonto || 0;
    const montoEstimaciones = estimations.reduce((acc, est) => acc + est.monto, 0);
    const receivedPayments = anticipo + montoEstimaciones;
    const totalMonto = contract.montoConIVA;
    const progress = totalMonto > 0 ? Math.round((receivedPayments / totalMonto) * 100) : 0;
    const remainingBalance = totalMonto - receivedPayments;
    const isFinalizado = ['Cerrado', 'Terminado'].includes(contract.estado);

    return { progress, remainingBalance, receivedPayments, isFinalizado };
  }, [contract]);

  if (isLoading) {
    return <ContractDetailsSkeleton />;
  }

  if (!contract) {
    return (
      <div className='text-center'>
         <p className="mb-4">No se encontró el contrato. Es posible que haya sido eliminado.</p>
         <Button asChild variant="ghost">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Contratos</Link>
        </Button>
      </div>
    );
  }

  const progressColor = progress >= 100 ? 'bg-green-500' : 'bg-accent';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <Button asChild variant="ghost">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Contratos</Link>
        </Button>
        <EditContractModal contract={contract} onContractUpdated={handleUpdateContract} />
      </div>
      
      <Card>
        <CardHeader>
           <CardDescription className="font-institutional flex items-center text-sm"><FileText className="mr-2 h-4 w-4" />Contrato No. {contract.id}</CardDescription>
          <CardTitle className="font-headline text-3xl pt-1">{contract.nombre}</CardTitle>
           <CardDescription className="flex items-center pt-2"><Users className="mr-2 h-4 w-4" /><span>{contract.cliente}</span></CardDescription>
          <div className="flex w-full justify-between items-center text-sm text-muted-foreground pt-4">
            <span>Progreso de Pago</span><span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className={`h-2 [&>div]:${progressColor}`} />
        </CardHeader>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Cuerpo Financiero</CardTitle>
            <CardDescription>Desglose detallado de los montos, anticipos y saldos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-background/50"><CardHeader><CardDescription className="flex items-center text-muted-foreground"><Landmark className="h-4 w-4 mr-2"/>Monto Base</CardDescription><CardTitle className="text-xl">{formatCurrency(contract.montoBase || 0)}</CardTitle></CardHeader></Card>
                <Card className="bg-background/50"><CardHeader><CardDescription className="flex items-center text-muted-foreground"><Percent className="h-4 w-4 mr-2"/>I.V.A. (16%)</CardDescription><CardTitle className="text-xl">{formatCurrency((contract.montoConIVA || 0) - (contract.montoBase || 0))}</CardTitle></CardHeader></Card>
                 {contract.anticipoMonto && <Card className="bg-background/50"><CardHeader><CardDescription className="flex items-center text-muted-foreground"><Banknote className="h-4 w-4 mr-2"/>Anticipo</CardDescription><CardTitle className="text-xl">{formatCurrency(contract.anticipoMonto)}</CardTitle></CardHeader></Card>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-blue-500/50"><CardHeader><CardDescription className="flex items-center text-blue-500"><DollarSign className="h-4 w-4 mr-2"/>Monto Total (IVA incl.)</CardDescription><CardTitle className="text-2xl font-bold text-blue-500">{formatCurrency(contract.montoConIVA || 0)}</CardTitle></CardHeader></Card>
                <Card className="border-green-500/50"><CardHeader><CardDescription className="flex items-center"><TrendingUp className="h-4 w-4 mr-2"/>Pagos Recibidos</CardDescription><CardTitle className="text-2xl font-bold text-green-500">{formatCurrency(receivedPayments)}</CardTitle></CardHeader></Card>
                <Card className="border-red-500/50"><CardHeader><CardDescription className="flex items-center"><TrendingDown className="h-4 w-4 mr-2"/>Saldo Restante</CardDescription><CardTitle className="text-2xl font-bold text-red-500">{formatCurrency(remainingBalance)}</CardTitle></CardHeader></Card>
            </div>
        </CardContent>
      </Card>

      {/* TODO: Re-implementar esta sección con datos de la API */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="font-headline text-2xl">Estimaciones</CardTitle>
                <CardDescription>Registro de pagos que afectan el presupuesto.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>Próximamente...</p>
        </CardContent>
      </Card> */}
    </div>
  );
}

function ContractDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-9 w-3/4 mb-3" />
          <Skeleton className="h-5 w-1/2" />
          <div className="flex w-full justify-between items-center text-sm text-muted-foreground pt-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-10" />
          </div>
          <Skeleton className="h-2 w-full mt-1" />
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
           </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, FileText, Users, DollarSign, Building, Banknote, Landmark, Percent, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import type { Contrato, Estimacion } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EditContractModal } from './EditContractModal';

// Importaciones de los nuevos componentes
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstimacionesTab } from './EstimacionesTab'; // Asegúrate que la ruta sea correcta
import { ApprovalFlow } from './ApprovalFlow'; // Asegúrate que la ruta sea correcta

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
      if (!response.ok) throw new Error('Contrato no encontrado');
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

  const handleFinalizeContract = async () => {
    if (!contract) return;
    try {
      const response = await fetch(`/api/contratos/${contract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contract, estado: 'Completado' }),
      });
      if (!response.ok) throw new Error('No se pudo finalizar el contrato');
      const data = await response.json();
      setContract(data.contrato);
      toast({ title: 'Contrato Finalizado', description: 'El contrato ha sido movido a \'En Retención\' y la fecha ha sido sellada.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const {
    progress, 
    isActionable,
  } = useMemo(() => {
    if (!contract) return { progress: 0, isActionable: false };
    const isActionable = contract.estado === 'Activo';
    // TODO: La lógica del progreso deberá recalcularse cuando las estimaciones se carguen de la API
    const progress = 0;
    return { progress, isActionable };
  }, [contract]);

  if (isLoading) return <ContractDetailsSkeleton />;

  if (!contract) {
    return (
      <div className='text-center'>
         <p className="mb-4">No se encontró el contrato. Es posible que haya sido eliminado.</p>
         <Button asChild variant="ghost"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Contratos</Link></Button>
      </div>
    );
  }

  // Forzamos la conversión a número para todos los cálculos
  const montoBase = parseFloat(String(contract.montoBase || 0));
  const montoConIVA = parseFloat(String(contract.montoConIVA || 0));
  const anticipoMonto = parseFloat(String(contract.anticipoMonto || 0));
  const ivaAmount = montoConIVA - montoBase;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <Button asChild variant="ghost"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Contratos</Link></Button>
        <div className='flex items-center gap-2'>
          {isActionable && <Button onClick={handleFinalizeContract} variant="outline"><CheckCircle className="mr-2 h-4 w-4" />Finalizar Contrato</Button>}
          <EditContractModal contract={contract} onContractUpdated={handleUpdateContract} disabled={!isActionable} />
        </div>
      </header>
      
      <main>
        <Card>
          <CardHeader>
            <CardDescription className="font-institutional flex items-center text-sm"><FileText className="mr-2 h-4 w-4" />Contrato No. {contract.id}</CardDescription>
            <CardTitle className="font-headline text-3xl pt-1">{contract.nombre}</CardTitle>
            <CardDescription className="flex items-center pt-2"><Users className="mr-2 h-4 w-4" /><span>{contract.cliente}</span></CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="estimaciones" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="estimaciones">Estimaciones y Pagos</TabsTrigger>
                <TabsTrigger value="aprobacion">Flujo de Aprobación</TabsTrigger>
            </TabsList>
            <TabsContent value="estimaciones" className="pt-6">
                <EstimacionesTab contract={contract} />
            </TabsContent>
            <TabsContent value="aprobacion" className="pt-6">
                <ApprovalFlow contract={contract} />
            </TabsContent>
        </Tabs>
      </main>
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
      <Card><CardHeader>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-9 w-3/4 mb-3" />
          <Skeleton className="h-5 w-1/2" />
      </CardHeader></Card>
       <Tabs defaultValue="estimaciones" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </TabsList>
            <TabsContent value="estimaciones" className="pt-6">
                <Skeleton className="h-96 w-full" />
            </TabsContent>
        </Tabs>
    </div>
  )
}

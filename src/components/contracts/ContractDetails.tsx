
'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Users,
  DollarSign,
  ArrowLeft,
  Building,
  Banknote,
  Landmark,
  Percent,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EstimationList } from './EstimationList';
import { AddEstimationModal } from './AddEstimationModal';
import { PaymentHistory } from './PaymentHistory';
import { ApprovalEvidence } from './ApprovalEvidence';
import type { Contrato, Estimacion, Transaction } from '@/lib/types';
import { mockContratos } from '@/lib/mock-data';


interface ContractDetailsProps {
  contractId: string;
}

export function ContractDetails({ contractId }: ContractDetailsProps) {
  const isLoading = false;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialContract = useMemo(
    () => mockContratos.find(c => c.id === contractId),
    [contractId]
  );
  
  const [contract, setContract] = useState<Contrato | undefined>(initialContract);
  const [estimations, setEstimations] = useState<Estimacion[]>(contract?.estimaciones || []);

  const handleAddEstimation = useCallback((newEstimation: Omit<Estimacion, 'id' | 'createdAt'>) => {
    const estimationToAdd: Estimacion = {
      ...newEstimation,
      id: `est-${Date.now()}`,
      createdAt: Date.now(),
      ocRecibida: newEstimation.tipo === 'Liquidación', 
    };
    setEstimations(prev => [...prev, estimationToAdd].sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const handleUpdateEstimation = useCallback((updatedEstimation: Estimacion) => {
    setEstimations(prev => prev.map(est => est.id === updatedEstimation.id ? updatedEstimation : est));
  }, []);

  const handleDeleteEstimation = useCallback((estimationId: string) => {
    setEstimations(prev => prev.filter(est => est.id !== estimationId));
  }, []);

  const handleApprovalChange = (fase: 'faseConstructoraAprobada' | 'faseControlPresupuestalAprobada', value: boolean) => {
    if (contract) {
      setContract(prev => prev ? { ...prev, [fase]: value } : undefined);
    }
  }

  const handleEvidenceUpload = (fase: 'faseConstructoraEvidencia' | 'faseControlPresupuestalEvidencia', files: File[]) => {
    if (contract) {
      const fileNames = files.map(file => file.name);
      setContract(prev => prev ? { ...prev, [fase]: [...(prev[fase] || []), ...fileNames] } : undefined);
    }
  }
  
  const handleMarkAsTerminado = () => {
    if (contract && contract.estado === 'Cerrado') {
      setContract(prev => prev ? { ...prev, estado: 'Terminado' } : undefined);
    }
  };

  const {
    progress, 
    remainingBalance, 
    receivedPayments,
    isFinalizado,
  } = useMemo(() => {
    if (!contract) return { progress: 0, remainingBalance: 0, receivedPayments: 0, isFinalizado: false };
    const anticipo = contract.anticipoMonto || 0;
    const montoEstimaciones = estimations.reduce((acc, est) => acc + est.monto, 0);
    const receivedPayments = anticipo + montoEstimaciones;
    const totalMonto = contract.montoConIVA;
    const progress = totalMonto === 0 ? 0 : Math.round((receivedPayments / totalMonto) * 100);
    const remainingBalance = totalMonto - receivedPayments;
    const isFinalizado = ['Cerrado', 'Terminado'].includes(contract.estado);

    return { progress, remainingBalance, receivedPayments, isFinalizado };
  }, [contract, estimations]);

  useEffect(() => {
    if (contract && remainingBalance <= 0 && contract.estado === 'Activo') {
      setContract(prev => prev ? { ...prev, estado: 'Cerrado' } : undefined);
    }
  }, [remainingBalance, contract]);

  const transactions: Transaction[] = useMemo(() => {
    if (!contract) return [];
    const allTransactions: Transaction[] = estimations.map(est => ({
      id: est.id,
      type: 'Estimación',
      description: est.observaciones || '',
      date: est.createdAt,
      amount: est.monto,
      evidence: est.evidencias,
      ordenCompraUrl: est.ordenCompraUrl,
      ocRecibida: est.ocRecibida
    }));

    if (contract.anticipoMonto && contract.anticipoFecha) {
      allTransactions.push({
        id: 'anticipo',
        type: 'Anticipo',
        description: 'Pago inicial del contrato',
        date: contract.anticipoFecha,
        amount: contract.anticipoMonto,
      });
    }

    return allTransactions.sort((a, b) => b.date - a.date);
  }, [contract, estimations]);

  const progressColor = useMemo(() => progress >= 100 ? 'bg-green-500' : 'bg-accent', [progress]);
  
  if (isLoading || !contract) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Contratos</Link>
        </Button>
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
                <Card className="bg-background/50"><CardHeader><CardDescription className="flex items-center text-muted-foreground"><Landmark className="h-4 w-4 mr-2"/>Monto Base</CardDescription><CardTitle className="text-xl">{formatCurrency(contract.montoBase)}</CardTitle></CardHeader></Card>
                <Card className="bg-background/50"><CardHeader><CardDescription className="flex items-center text-muted-foreground"><Percent className="h-4 w-4 mr-2"/>I.V.A. (16%)</CardDescription><CardTitle className="text-xl">{formatCurrency(contract.montoConIVA - contract.montoBase)}</CardTitle></CardHeader></Card>
                 {contract.anticipoMonto && <Card className="bg-background/50"><CardHeader><CardDescription className="flex items-center text-muted-foreground"><Banknote className="h-4 w-4 mr-2"/>Anticipo</CardDescription><CardTitle className="text-xl">{formatCurrency(contract.anticipoMonto)}</CardTitle></CardHeader></Card>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-blue-500/50"><CardHeader><CardDescription className="flex items-center text-blue-500"><DollarSign className="h-4 w-4 mr-2"/>Monto Total (IVA incl.)</CardDescription><CardTitle className="text-2xl font-bold text-blue-500">{formatCurrency(contract.montoConIVA)}</CardTitle></CardHeader></Card>
                <Card className="border-green-500/50"><CardHeader><CardDescription className="flex items-center"><TrendingUp className="h-4 w-4 mr-2"/>Pagos Recibidos</CardDescription><CardTitle className="text-2xl font-bold text-green-500">{formatCurrency(receivedPayments)}</CardTitle></CardHeader></Card>
                <Card className="border-red-500/50"><CardHeader><CardDescription className="flex items-center"><TrendingDown className="h-4 w-4 mr-2"/>Saldo Restante</CardDescription><CardTitle className="text-2xl font-bold text-red-500">{formatCurrency(remainingBalance)}</CardTitle></CardHeader></Card>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="font-headline text-2xl">Estimaciones</CardTitle>
                <CardDescription>Registro de pagos que afectan el presupuesto.</CardDescription>
            </div>
            <AddEstimationModal contractId={contract.id} onAddEstimation={handleAddEstimation} remainingBalance={remainingBalance} />
        </CardHeader>
        <CardContent>
          <EstimationList estimations={estimations as Estimacion[]} onUpdateEstimation={handleUpdateEstimation} onDeleteEstimation={handleDeleteEstimation} isFinalizado={isFinalizado} />
        </CardContent>
      </Card>

      <PaymentHistory transactions={transactions} />

      {isFinalizado && (
        <Card>
          <CardHeader>
              <CardTitle className="font-headline text-2xl">Validación Final</CardTitle>
              <CardDescription>
                  {contract.estado === 'Cerrado'
                      ? 'El contrato ha sido liquidado. Confirme para marcarlo como terminado.'
                      : 'El ciclo de este contrato ha sido completado.'}
              </CardDescription>
          </CardHeader>
          <CardContent>
              {contract.estado === 'Cerrado' ? (
                  <Button onClick={handleMarkAsTerminado}>
                      <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                      Marcar como Terminado
                  </Button>
              ) : (
                  <div className="flex items-center text-lg font-medium text-green-600 p-4 bg-green-500/10 rounded-lg">
                      <CheckCircle className="mr-3 h-6 w-6" />
                      Contrato Terminado
                  </div>
              )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Flujo de Aprobación</CardTitle>
            <CardDescription>Gestiona el estado de aprobación del contrato.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center"><Checkbox id="constructora" checked={contract.faseConstructoraAprobada} onCheckedChange={(checked) => handleApprovalChange('faseConstructoraAprobada', checked as boolean)} className="h-5 w-5" disabled={isFinalizado} /><Label htmlFor="constructora" className="flex items-center font-medium ml-3"><Building className="mr-2 h-5 w-5 text-primary"/>CONSTRUCTORA</Label><ApprovalEvidence evidence={contract.faseConstructoraEvidencia} onAddEvidence={(files) => handleEvidenceUpload('faseConstructoraEvidencia', files)} /></div>
            <div className="flex items-center"><Checkbox id="control" checked={contract.faseControlPresupuestalAprobada} onCheckedChange={(checked) => handleApprovalChange('faseControlPresupuestalAprobada', checked as boolean)} className="h-5 w-5" disabled={isFinalizado} /><Label htmlFor="control" className="flex items-center font-medium ml-3"><Banknote className="mr-2 h-5 w-5 text-primary"/>CONTROL PRESUPUESTAL</Label><ApprovalEvidence evidence={contract.faseControlPresupuestalEvidencia} onAddEvidence={(files) => handleEvidenceUpload('faseControlPresupuestalEvidencia', files)} /></div>
        </CardContent>
      </Card>
    </div>
  );
}

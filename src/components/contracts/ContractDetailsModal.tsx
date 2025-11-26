'use client';

import React, { useState } from 'react';
import type { Contrato, Transaction, Estimacion } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AddEstimacionModal } from './AddEstimacionModal';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileSignature,
  PlusCircle,
  Pencil,
  Trash2,
  Download,
  FileText
} from 'lucide-react';

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <div className="grid grid-cols-4 gap-4 items-center p-3 border-b last:border-b-0 text-sm">
        <div className="col-span-2 flex items-center">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md mr-3">
                <FileText className="h-4 w-4 text-muted-foreground"/>
            </div>
            <div>
                <p className="font-medium">{transaction.type}</p>
                <p className="text-muted-foreground text-xs">{transaction.description}</p>
            </div>
        </div>
        <p className="font-mono text-muted-foreground">{formatDate(transaction.date)}</p>
        <div className="flex justify-between items-center">
            <p className="font-mono">{formatCurrency(transaction.amount)}</p>
            {transaction.evidence?.length ? (
              <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
            ) : (
              <p className="text-xs text-muted-foreground">N/A</p>
            )}
        </div>
    </div>
);

interface FinancialStatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  accentColor?: 'blue' | 'green' | 'red';
}

const FinancialStatCard: React.FC<FinancialStatCardProps> = ({ title, value, icon: Icon, accentColor }) => {
  const accentClasses = {
    blue: 'border-l-4 border-blue-500',
    green: 'border-l-4 border-green-500',
    red: 'border-l-4 border-red-500',
  };

  return (
    <Card className={cn("p-4 flex items-center", accentColor ? accentClasses[accentColor] : '')}>
        <Icon className={`h-6 w-6 mr-4 ${accentColor ? `text-${accentColor}-500` : 'text-muted-foreground'}`} />
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold font-mono">{value}</p>
        </div>
    </Card>
  );
};

const EstimacionRow: React.FC<{ estimacion: Estimacion }> = ({ estimacion }) => (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <div>
            <p className="font-semibold">{estimacion.observaciones || 'Instalación de muestra'}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <Badge variant="outline" className="font-mono text-xs">{estimacion.tipo}</Badge>
                <span className="font-mono">{formatCurrency(estimacion.monto)}</span>
                <span>{formatDate(estimacion.createdAt)}</span>
                {estimacion.ocRecibida && <Badge variant="success">O.C. Recibida</Badge>}
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
        </div>
    </div>
);

interface ContractDetailsModalProps {
  contract: Contrato | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractDetailsModal({ contract: initialContract, isOpen, onClose }: ContractDetailsModalProps) {
  const [contract, setContract] = useState(initialContract);
  const [isAddEstimacionOpen, setAddEstimacionOpen] = useState(false);

  React.useEffect(() => {
    setContract(initialContract);
  }, [initialContract]);

  if (!contract) return null;

  const handleAddEstimacion = (data: any) => {
    const newEstimacion: Estimacion = {
        id: `est-${Date.now()}`,
        monto: data.monto,
        observaciones: data.observaciones,
        evidencias: data.evidencias.map((f: File) => f.name),
        createdAt: Date.now(),
        tipo: 'Parcial',
        ocRecibida: false,
    };

    const updatedContract = {
        ...contract,
        estimaciones: [...(contract.estimaciones || []), newEstimacion]
    };
    setContract(updatedContract);
    console.log("Contrato actualizado con nueva estimación:", updatedContract);
  };

  const montoBase = contract.montoBase || 0;
  const montoTotal = contract.montoConIVA || 0;
  const ivaAmount = montoTotal - montoBase;
  const anticipo = contract.anticipoMonto || 0;

  const totalEstimaciones = (contract.estimaciones || []).reduce((sum, est) => sum + est.monto, 0);
  const pagosRecibidos = anticipo + totalEstimaciones;
  const saldoRestante = montoTotal - pagosRecibidos;
  const progressPercentage = montoTotal > 0 ? (pagosRecibidos / montoTotal) * 100 : 0;

  const realTransactions: Transaction[] = [];
  if (contract.anticipoMonto && contract.anticipoFecha) {
    realTransactions.push({
      id: 'anticipo_txn',
      type: 'Anticipo',
      description: 'Pago inicial del contrato',
      date: contract.anticipoFecha,
      amount: contract.anticipoMonto,
    });
  }
  const estimacionesTransactions: Transaction[] = (contract.estimaciones || []).map(est => ({
    id: est.id,
    type: 'Estimación',
    description: est.observaciones || `Estimación del ${formatDate(est.createdAt)}`,
    date: est.createdAt,
    amount: est.monto,
    evidence: est.evidencias,
  }));
  realTransactions.push(...estimacionesTransactions);
  realTransactions.sort((a, b) => b.date - a.date);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl p-0">
          <div className="max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <p className="text-sm text-muted-foreground">Contrato No. {contract.id}</p>
              <DialogTitle className="text-3xl font-bold">{contract.nombre}</DialogTitle>
              <DialogDescription className="flex items-center pt-1">
                <FileSignature className="h-4 w-4 mr-2"/> {contract.cliente}
              </DialogDescription>
            </DialogHeader>

            <div className="mb-6">
                <p className="text-sm font-medium mb-1">Progreso de Pago</p>
                <Progress value={progressPercentage} className="w-full"/>
                <p className="text-right text-sm font-mono mt-1 text-muted-foreground">{progressPercentage.toFixed(0)}%</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cuerpo Financiero</CardTitle>
                <CardDescription>Desglose detallado de los montos, anticipos y saldos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <FinancialStatCard title="Monto Base" value={formatCurrency(montoBase)} icon={Wallet} />
                  <FinancialStatCard title="I.V.A. (16%)" value={formatCurrency(ivaAmount)} icon={Percent} />
                  <FinancialStatCard title="Anticipo" value={formatCurrency(anticipo)} icon={DollarSign} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FinancialStatCard title="Monto Total (IVA incl.)" value={formatCurrency(montoTotal)} icon={TrendingUp} accentColor="blue" />
                  <FinancialStatCard title="Pagos Recibidos" value={formatCurrency(pagosRecibidos)} icon={TrendingDown} accentColor="green" />
                  <FinancialStatCard title="Saldo Restante" value={formatCurrency(saldoRestante)} icon={TrendingDown} accentColor="red" />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Estimaciones</CardTitle>
                      <CardDescription>Registro de pagos que afectan el presupuesto.</CardDescription>
                    </div>
                    <Button onClick={() => setAddEstimacionOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/> Agregar Estimación</Button>
                </CardHeader>
                <CardContent className="p-0">
                    {(contract.estimaciones && contract.estimaciones.length > 0) ? (
                      <div>
                        {contract.estimaciones.map(est => <EstimacionRow key={est.id} estimacion={est} />)}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground p-10">
                        <p>No hay estimaciones para este contrato.</p>
                      </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="mb-6">
              <CardTitle>Histórico de Transacciones</CardTitle>
              <CardDescription>Un registro de todos los pagos recibidos para este contrato.</CardDescription>
              <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-muted-foreground p-3 mt-2">
                  <div className="col-span-2">Concepto</div>
                  <div>Fecha</div>
                  <div className="text-right">Monto</div>
              </div>
              <div>
                  {realTransactions.map(tx => <TransactionRow key={tx.id} transaction={tx}/>)}
              </div>
            </div>

             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Flujo de Aprobación</CardTitle>
                    <CardDescription>Gestiona el estado de aprobación del contrato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="constructora-check" checked={contract.faseConstructoraAprobada} />
                        <label htmlFor="constructora-check" className="font-medium leading-none">CONSTRUCTORA</label>
                        <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer"/>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="control-check" checked={contract.faseControlPresupuestalAprobada} />
                        <label htmlFor="control-check" className="font-medium leading-none">CONTROL PRESUPUESTAL</label>
                        <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer"/>
                    </div>
                </CardContent>
              </Card>

          </div>
        </DialogContent>
      </Dialog>

      <AddEstimacionModal 
        isOpen={isAddEstimacionOpen}
        onClose={() => setAddEstimacionOpen(false)}
        onEstimacionAdded={handleAddEstimacion}
        contractId={contract.id}
      />
    </>
  );
}

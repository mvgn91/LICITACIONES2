
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Contrato } from '@/lib/types';
import { ContractStatusBadge } from './ContractStatusBadge';

interface ContractCardProps {
  contract: Contrato;
}

export function ContractCard({ contract }: ContractCardProps) {
  const { id, nombre, cliente, montoConIVA, fechaInicio, estado, estimaciones } = contract;
  
  // Se asume que las estimaciones están cargadas con el contrato
  const montoEstimado = estimaciones?.reduce((sum, est) => sum + est.monto, 0) || 0;
  const anticipo = contract.anticipoMonto || 0;
  const pagosRecibidos = anticipo + montoEstimado;
  const progresoPago = montoConIVA > 0 ? Math.round((pagosRecibidos / montoConIVA) * 100) : 0;

  return (
    <Card asChild className="hover:border-primary/80 transition-colors">
      <Link href={`/contracts/${id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl mb-1">{nombre}</CardTitle>
            <ContractStatusBadge status={estado} />
          </div>
          <CardDescription>{cliente}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex w-full justify-between items-center text-sm text-muted-foreground mb-1">
                <span className="font-medium">Progreso de Pago</span><span className="font-semibold text-foreground">{progresoPago}%</span>
            </div>
          <Progress value={progresoPago} className="h-2" />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-between">
          <span>{formatCurrency(montoConIVA)}</span>
          <span>Inició: {formatDate(fechaInicio)}</span>
        </CardFooter>
      </Link>
    </Card>
  );
}

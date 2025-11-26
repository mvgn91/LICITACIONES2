'use client';

import type { Contrato as ContratoType, Estimacion } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from '@/lib/utils';
import { Building, FileSignature, ArrowRight } from 'lucide-react';

interface ContractListItemProps {
  contract: ContratoType & { estimaciones?: Estimacion[] };
  onClick: () => void;
}

function getStatusBadge(status: string | undefined) {
  switch (status) {
    case 'Activo':
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
    case 'Completado':
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
    case 'Pendiente':
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
  }
}

export function ContractListItem({ contract, onClick }: ContractListItemProps) {
  const montoTotal = contract.montoConIVA || 0;
  const totalEstimaciones = (contract.estimaciones || []).reduce((sum, est) => sum + est.monto, 0);
  const pagosRecibidos = (contract.anticipoMonto || 0) + totalEstimaciones;
  const saldoRestante = montoTotal - pagosRecibidos;
  const progressPercentage = montoTotal > 0 ? (pagosRecibidos / montoTotal) * 100 : 0;

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-slate-100 rounded-md">
                <Building className="h-5 w-5 text-muted-foreground"/>
            </div>
            <div>
                <CardTitle className="text-lg font-bold leading-tight">{contract.nombre}</CardTitle>
                <CardDescription className="flex items-center text-sm pt-1">
                    <FileSignature className="h-3 w-3 mr-1.5"/> {contract.cliente}
                </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs font-semibold", getStatusBadge(contract.estado))}>
            {contract.estado}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm font-medium">Progreso</p>
                    <p className="text-sm font-mono text-muted-foreground">{progressPercentage.toFixed(1)}%</p>
                </div>
                <Progress value={progressPercentage} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">Monto Total</div>
                <div className="font-mono text-right">{formatCurrency(montoTotal)}</div>
                
                <div className="text-muted-foreground">Pagos Recibidos</div>
                <div className="font-mono text-right text-green-600">{formatCurrency(pagosRecibidos)}</div>

                <div className="text-muted-foreground">Saldo Restante</div>
                <div className="font-mono text-right text-red-600">{formatCurrency(saldoRestante)}</div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={onClick} className="w-full" variant="outline">
          Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

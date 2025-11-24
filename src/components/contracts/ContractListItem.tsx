
'use client';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  ChevronRight,
  FileText,
} from 'lucide-react';
import type { Contrato, Estimacion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

interface ContractListItemProps {
  contract: Contrato & { estimaciones?: Omit<Estimacion, 'isCompleted'>[] };
}

export function ContractListItem({ contract }: ContractListItemProps) {

  const progress = useMemo(() => {
    const anticipo = contract.anticipoMonto || 0;
    if (contract.montoConIVA === 0) return 0;
    const montoEstimado = contract.estimaciones?.reduce((acc, est) => acc + (est.monto || 0), 0) || 0;
    const totalPagado = anticipo + montoEstimado;
    return Math.round((totalPagado / contract.montoConIVA) * 100);
  }, [contract]);

  const progressColor = useMemo(() => progress >= 100 ? 'bg-green-500' : 'bg-accent', [progress]);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardDescription className="font-institutional flex items-center text-xs">
            <FileText className="mr-2 h-4 w-4" />
            Contrato No. {contract.id}
          </CardDescription>
          <Badge variant={contract.estado === 'Activo' ? 'default' : 'secondary'} className={cn(
              'text-xs',
              contract.estado === 'Activo' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
          )}>
              {contract.estado}
          </Badge>
        </div>
        <CardTitle className="font-headline text-2xl pt-1 truncate text-primary">{contract.nombre}</CardTitle>
        <CardDescription className="flex items-center text-sm pt-1">
          <Users className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{contract.cliente}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="w-full">
          <div className="flex w-full justify-between text-xs text-muted-foreground mb-1">
            <span>Progreso de Pago</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className={`h-2 [&>div]:${progressColor}`} />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 p-4 justify-end">
        <Button asChild variant="ghost" size="sm">
            <Link href={`/contracts/${contract.id}`}>
                Ver Detalles
                <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  ChevronRight,
} from 'lucide-react';
import type { Contrato, Estimacion } from '@/lib/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface ContractListItemProps {
  contract: Contrato & { estimaciones?: Omit<Estimacion, 'isCompleted'>[] };
}

export function ContractListItem({ contract }: ContractListItemProps) {

  const calculateProgress = () => {
    if (!contract.estimaciones || contract.estimaciones.length === 0 || contract.montoConIVA === 0) {
      return 0;
    }
    const montoEstimado = contract.estimaciones.reduce((acc, est) => acc + (est.monto || 0), 0);
    return Math.round((montoEstimado / contract.montoConIVA) * 100);
  };

  const progress = calculateProgress();

  return (
    <Link href={`/contracts/${contract.id}`} className="block transition-colors duration-200 hover:bg-muted/50">
      <div className="p-4 flex items-center gap-4">
        <div className="flex-grow grid grid-cols-12 gap-4 items-center">
          
          <div className="col-span-12 md:col-span-5">
            <h3 className="font-headline text-base font-semibold truncate text-primary">{contract.nombre}</h3>
            <p className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{contract.cliente}</span>
            </p>
          </div>

          <div className="col-span-6 md:col-span-2 flex items-center">
             <Badge variant={contract.estado === 'Activo' ? 'default' : 'secondary'} className={cn('w-fit', contract.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
              {contract.estado}
             </Badge>
          </div>
          
          <div className="col-span-6 md:col-span-5 w-full">
            <div className="flex w-full justify-between text-xs text-muted-foreground mb-1">
              <span>Progreso</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

        </div>

        <div className="ml-auto pl-4">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

      </div>
    </Link>
  );
}

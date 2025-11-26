
'use client';

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
import { useMemo } from 'react';

interface ContractListItemProps {
  contract: Contrato & { estimaciones?: Omit<Estimacion, 'isCompleted'>[] };
  onClick: () => void;
}

export function ContractListItem({ contract, onClick }: ContractListItemProps) {

  const progress = useMemo(() => {
    // TODO: This logic will be updated once payment history is implemented
    return 0; 
  }, [contract]);

  const progressColor = useMemo(() => progress >= 100 ? 'bg-green-500' : 'bg-accent', [progress]);

  return (
    <Card 
      className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick} // This makes the whole card clickable
    >
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
        <div className="flex items-center text-sm font-semibold text-accent-foreground">
          Ver Detalles
          <ChevronRight className="ml-2 h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}

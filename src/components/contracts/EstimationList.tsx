
'use client';

import { useTransition } from 'react';
import type { Estimacion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { FileDown, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

interface EstimationListProps {
  contractId: string;
  estimations: any[];
  isLoading: boolean;
}

export function EstimationList({ contractId, estimations, isLoading }: EstimationListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const firestore = useFirestore();

  const handleStatusChange = (estimationId: string, isCompleted: boolean) => {
    startTransition(() => {
        const estimationRef = doc(firestore, `contratos/${contractId}/estimaciones`, estimationId);
        const updateData = { isCompleted };
        
        updateDocumentNonBlocking(estimationRef, updateData);
        
        toast({
            title: 'Estado Actualizado',
            description: 'El estado de la estimación ha sido guardado.',
        });
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="flex items-center p-4">
            <Skeleton className="h-5 w-5 mr-4" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-24 justify-self-start md:justify-self-center" />
              <Skeleton className="h-5 w-28 justify-self-start md:justify-self-end" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!estimations || estimations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        Aún no se han agregado estimaciones a este contrato.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estimations.map((estimation) => {
        const evidenceUrl = estimation.evidencias && estimation.evidencias[0];
        const isImage = evidenceUrl?.match(/\.(jpeg|jpg|gif|png)$/) != null;
        return (
            <Card
            key={estimation.id}
            className={cn(
                'flex items-center p-4 transition-colors duration-200',
                estimation.isCompleted ? 'bg-muted/50' : 'bg-card'
            )}
            >
            <Checkbox
                id={`estimation-${estimation.id}`}
                checked={estimation.isCompleted}
                onCheckedChange={(checked) => handleStatusChange(estimation.id, !!checked)}
                className="mr-4 h-5 w-5"
                disabled={isPending}
                aria-label={`Marcar estimación ${estimation.observaciones} como completada`}
            />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label
                    htmlFor={`estimation-${estimation.id}`}
                    className={cn('font-medium leading-none cursor-pointer', estimation.isCompleted && 'line-through text-muted-foreground')}
                >
                    {estimation.observaciones}
                </label>
                <Badge variant="outline" className="w-fit justify-self-start md:justify-self-center">{formatCurrency(estimation.monto)}</Badge>

                {evidenceUrl && (
                     <Link href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center justify-self-start md:justify-self-end">
                        {isImage ? <ImageIcon className="mr-2 h-4 w-4" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Ver Evidencia
                    </Link>
                )}
            </div>
            </Card>
        )}
      )}
    </div>
  );
}

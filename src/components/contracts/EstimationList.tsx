
'use client';

import { useTransition } from 'react';
import type { Estimation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { FileDown, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const db = getFirestore(app);

interface EstimationListProps {
  contractId: string;
  estimations: any[];
}

export function EstimationList({ contractId, estimations }: EstimationListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (estimationId: string, isCompleted: boolean) => {
    startTransition(() => {
        const estimationRef = doc(db, `contratos/${contractId}/estimaciones`, estimationId);
        const updateData = { isCompleted };
        
        updateDoc(estimationRef, updateData)
            .then(() => {
                toast({
                    title: 'Estado Actualizado',
                    description: 'El estado de la estimación ha sido guardado.',
                });
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: estimationRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
                // No need for a toast here, the listener will handle it.
            });
    });
  };

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

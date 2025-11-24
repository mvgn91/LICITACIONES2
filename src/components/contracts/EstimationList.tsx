
'use client';

import { useState } from 'react';
import type { Estimacion } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { EditEstimationModal } from './EditEstimationModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EstimationListProps {
  estimations: Estimacion[];
  onUpdateEstimation: (updatedEstimation: Estimacion) => void;
  onDeleteEstimation: (estimationId: string) => void;
  isFinalizado: boolean;
}

export function EstimationList({ estimations, onUpdateEstimation, onDeleteEstimation, isFinalizado }: EstimationListProps) {
  const [editingEstimation, setEditingEstimation] = useState<Estimacion | null>(null);

  if (!estimations || estimations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 border rounded-lg bg-background">
        Aún no se han agregado estimaciones a este contrato.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {estimations.map((estimation) => (
          <Card key={estimation.id} className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
              <div className="flex-grow mb-3 sm:mb-0">
                <p className="font-medium leading-tight">{estimation.observaciones}</p>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm mt-1">
                    <Badge variant={estimation.tipo === 'Liquidación' ? 'destructive' : 'secondary'}>{estimation.tipo}</Badge>
                    <p className="font-semibold text-muted-foreground">{formatCurrency(estimation.monto)}</p>
                    <p className="text-muted-foreground hidden md:block">{formatDate(estimation.createdAt)}</p>
                    {estimation.ocRecibida && (
                        <Badge variant="outline" className="text-green-600 border-green-600/50">O.C. Recibida</Badge>
                    )}
                </div>
              </div>

              <div className="flex items-center space-x-1 self-end sm:self-center flex-shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditingEstimation(estimation)} disabled={isFinalizado}>
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" disabled={isFinalizado}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está seguro de eliminar?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción es permanente. La estimación será eliminada y el presupuesto del contrato se recalculará.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteEstimation(estimation.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
      ))}
      {editingEstimation && (
        <EditEstimationModal
          estimation={editingEstimation}
          isOpen={!!editingEstimation}
          onClose={() => setEditingEstimation(null)}
          onUpdate={(updated) => {
            onUpdateEstimation(updated);
            setEditingEstimation(null);
          }}
        />
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AddEstimationModal({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    toast({
      title: 'Función no disponible',
      description: 'La adición de estimaciones se implementará en una fase posterior.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Agregar Estimación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Agregar Nueva Estimación</DialogTitle>
          <DialogDescription>
            La funcionalidad para agregar nuevas estimaciones se habilitará una vez que la integración con la base de datos esté completa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleAdd}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

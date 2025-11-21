
'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function AddContractModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    toast({
      title: 'Función no disponible',
      description: 'La adición de contratos se implementará en una fase posterior.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus />
          Agregar Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Agregar Nuevo Contrato</DialogTitle>
          <DialogDescription>
            La funcionalidad para agregar nuevos contratos se habilitará una vez que la integración con la base de datos esté completa.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-4">
            <Button onClick={handleAdd}>Aceptar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

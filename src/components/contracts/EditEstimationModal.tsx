
'use client';

import React, { useState, useEffect } from 'react';
import { FilePenLine, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Estimacion } from '@/lib/types';

// Esquema de validación para el formulario de edición
const estimacionSchema = z.object({
  monto: z.coerce.number().positive('El monto debe ser un número positivo.'),
  descripcion: z.string().optional(),
  // No incluimos 'tipo' porque no debería ser editable una vez creada.
});

type EstimacionFormData = z.infer<typeof estimacionSchema>;

interface EditEstimationModalProps {
  estimacion: Estimacion;
  onEstimationUpdated: (updatedEstimation: Estimacion) => void;
}

export function EditEstimationModal({ estimacion, onEstimationUpdated }: EditEstimationModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EstimacionFormData>({
    resolver: zodResolver(estimacionSchema),
  });

  useEffect(() => {
    if (estimacion) {
      form.reset({
        monto: parseFloat(String(estimacion.monto)),
        descripcion: estimacion.descripcion || '',
      });
    }
  }, [estimacion, form]);

  const onSubmit = async (data: EstimacionFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/estimaciones/${estimacion.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la estimación.');
      }

      const { estimacion: updatedEstimation } = await response.json();

      onEstimationUpdated(updatedEstimation);
      toast({
        title: 'Estimación Actualizada',
        description: `La estimación ha sido guardada correctamente.`,
        variant: 'success',
      });
      setOpen(false);

    } catch (error) {
      toast({
        title: 'Error al Guardar',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><FilePenLine className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Estimación #{estimacion.numero}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción / Observaciones</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='pt-4'>
                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

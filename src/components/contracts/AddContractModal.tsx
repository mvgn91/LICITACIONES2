
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast';
import type { Contrato } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Simplified schema matching the essential API fields
const contractSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  cliente_nombre: z.string().min(3, 'El cliente debe tener al menos 3 caracteres.'),
  monto_total: z.coerce.number().positive('El monto total debe ser un número positivo.'),
  fecha_inicio: z.date({ required_error: 'La fecha de inicio es requerida.' }),
  fecha_fin: z.date({ required_error: 'La fecha de término es requerida.' }),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContract: (contract: Contrato) => void;
}

export function AddContractModal({ isOpen, onClose, onAddContract }: AddContractModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    // Set empty strings or undefined for default values to match uncontrolled->controlled logic
    defaultValues: {
      nombre: '',
      cliente_nombre: '',
    },
  });
  
  useEffect(() => {
    // Reset form when the modal opens or closes
    if (!isOpen) {
      form.reset({
        nombre: '',
        cliente_nombre: '',
        monto_total: 0,
        fecha_inicio: undefined,
        fecha_fin: undefined
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: ContractFormData) => {
    setIsSubmitting(true);
    try {
      // Format dates before sending
      const apiData = {
        ...data,
        fecha_inicio: format(data.fecha_inicio, 'yyyy-MM-dd'),
        fecha_fin: format(data.fecha_fin, 'yyyy-MM-dd'),
      };

      const response = await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el contrato.');
      }

      const { contrato: newContract } = await response.json();
      
      toast({
        title: 'Contrato Creado Exitosamente',
        description: `El contrato "${newContract.nombre}" ha sido guardado.`,
        variant: 'success'
      });
      onAddContract(newContract); // Callback to update the parent component
      onClose(); // Close the modal on success

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Contrato</DialogTitle>
          <DialogDescription>
            Complete los detalles esenciales para crear un nuevo contrato.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Contrato</FormLabel><FormControl><Input placeholder="Ej. Residencia Los Robles" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cliente_nombre" render={({ field }) => (<FormItem><FormLabel>Cliente</FormLabel><FormControl><Input placeholder="Ej. Familia González" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="monto_total" render={({ field }) => (<FormItem><FormLabel>Monto Total</FormLabel><FormControl><Input type="number" step="0.01" placeholder="120000" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="fecha_inicio" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Inicio</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP', { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar locale={es} mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="fecha_fin" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Término</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP', { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar locale={es} mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              </div>
            <DialogFooter className='pt-4'>
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Guardando...' : 'Guardar Contrato'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

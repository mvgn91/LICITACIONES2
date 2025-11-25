
'use client';

import React, { useState, useEffect } from 'react';
import { FilePenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import type { Contrato } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const contractSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  cliente: z.string().min(3, 'El cliente debe tener al menos 3 caracteres.'),
  montoConIVA: z.coerce.number().positive('El monto total debe ser un número positivo.'),
  fechaInicio: z.date({ required_error: 'La fecha de inicio es requerida.' }),
  fechaTerminoEstimada: z.date({ required_error: 'La fecha de término es requerida.' }),
  anticipoMonto: z.coerce.number().positive('El monto del anticipo debe ser un número positivo.'),
  anticipoFecha: z.date({ required_error: 'La fecha del anticipo es requerida.' }),
  estado: z.string(), // Añadimos el estado al esquema
});

type ContractFormData = z.infer<typeof contractSchema>;

interface EditContractModalProps {
  contract: Contrato;
  onContractUpdated: (contract: Contrato) => void;
}

export function EditContractModal({ contract, onContractUpdated }: EditContractModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  useEffect(() => {
    if (contract) {
      form.reset({
        nombre: contract.nombre,
        cliente: contract.cliente,
        montoConIVA: contract.montoConIVA,
        fechaInicio: new Date(contract.fechaInicio),
        fechaTerminoEstimada: new Date(contract.fechaTerminoEstimada),
        anticipoMonto: contract.anticipoMonto || 0,
        anticipoFecha: new Date(contract.anticipoFecha || Date.now()),
        estado: contract.estado,
      });
    }
  }, [contract, form]);

  const onSubmit = async (data: ContractFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/contratos/${contract.id}`,
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
        throw new Error(errorData.error || 'Error al actualizar el contrato.');
      }

      const { contrato: updatedContract } = await response.json();

      onContractUpdated(updatedContract);
      toast({
        title: 'Contrato Actualizado',
        description: `El contrato "${updatedContract.nombre}" ha sido guardado correctamente.`,
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
        <Button variant="outline"><FilePenLine className="-ml-1 mr-2 h-4 w-4" />Editar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Contrato</DialogTitle>
          <DialogDescription>
            Modifique los detalles del contrato y guarde los cambios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 pt-4">
                 {/* Columna Izquierda */}
                <div className='space-y-4'>
                    <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Contrato</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="cliente" render={({ field }) => (<FormItem><FormLabel>Cliente</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="montoConIVA" render={({ field }) => (<FormItem><FormLabel>Monto Total (con IVA)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="fechaInicio" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Inicio</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="fechaTerminoEstimada" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Término</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    </div>
                </div>
                 {/* Columna Derecha */}
                <div className='space-y-4'>
                    <div className="space-y-4 rounded-md border p-4 bg-background/50 h-fit">
                        <h3 className="font-medium leading-none">Datos del Anticipo</h3>
                        <FormField control={form.control} name="anticipoMonto" render={({ field }) => (<FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="anticipoFecha" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    </div>
                </div>
            </div>
            
            <DialogFooter className='pt-4'>
                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

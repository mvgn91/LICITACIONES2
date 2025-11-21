
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, Timestamp } from 'firebase/firestore';

const contractSchema = z.object({
  nombre: z.string().min(1, 'El nombre del proyecto es requerido'),
  cliente: z.string().min(1, 'El nombre del cliente es requerido'),
  montoConIVA: z.coerce.number().min(0, 'El monto debe ser positivo'),
  fechaInicio: z.date({ required_error: 'La fecha de inicio es requerida' }),
  fechaTerminoEstimada: z.date({ required_error: 'La fecha de término estimada es requerida' }),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export function AddContractModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      nombre: '',
      cliente: '',
      montoConIVA: 0,
    },
  });

  async function onSubmit(data: ContractFormValues) {
    if (!user || !firestore) {
      toast({
        title: 'Error',
        description: 'Debe iniciar sesión para crear un contrato.',
        variant: 'destructive',
      });
      return;
    }
    
    const newContractData = {
        ...data,
        fechaInicio: Timestamp.fromDate(data.fechaInicio),
        fechaTerminoEstimada: Timestamp.fromDate(data.fechaTerminoEstimada),
        createdAt: serverTimestamp(),
        estado: 'Activo' as const,
        userId: user.uid,
        montoBase: 0,
        montoSinIVA: 0,
        descripcion: '',
        docConstructoraOK: false,
        docControlOK: false,
    };
    
    const contractsCollection = collection(firestore, 'contratos');
    await addDocumentNonBlocking(contractsCollection, newContractData);

    toast({
      title: 'Contrato Agregado',
      description: 'El nuevo contrato ha sido agregado exitosamente.',
    });
    setOpen(false);
    form.reset();
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            Complete los detalles para crear un nuevo contrato.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Remodelación Cocina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="montoConIVA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Total (IVA incluido)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaInicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP', { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaTerminoEstimada"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Término Estimada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP', { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Agregando...' : 'Agregar Contrato'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

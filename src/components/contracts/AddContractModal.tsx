
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
  montoConIVA: z.coerce.number().positive('El monto debe ser un número positivo.'),
  descripcion: z.string().optional(),
  fechaInicio: z.date({
    required_error: 'La fecha de inicio es requerida.',
  }),
  fechaTerminoEstimada: z.date({
    required_error: 'La fecha de término es requerida.',
  }),
});

type ContractFormData = z.infer<typeof contractSchema>;

export function AddContractModal({ onAddContract }: { onAddContract: (contract: Contrato) => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      nombre: '',
      cliente: '',
      montoConIVA: 0,
      descripcion: '',
    },
  });

  const onSubmit = (data: ContractFormData) => {
    const newContract: Contrato = {
      id: `contrato-${Date.now()}`,
      ...data,
      montoBase: data.montoConIVA / 1.16, // Assuming 16% IVA
      montoSinIVA: data.montoConIVA / 1.16,
      fechaInicio: data.fechaInicio.getTime(),
      fechaTerminoEstimada: data.fechaTerminoEstimada.getTime(),
      estado: 'Activo',
      createdAt: Date.now(),
      userId: 'user-local',
    };
    onAddContract(newContract);
    toast({
      title: 'Contrato Agregado (Simulado)',
      description: `El contrato "${data.nombre}" ha sido agregado a la lista local.`,
    });
    setOpen(false);
    form.reset();
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
            Complete los detalles para crear un nuevo contrato.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Contrato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Residencia Los Robles" {...field} />
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
                      <Input placeholder="Ej. Familia González" {...field} />
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
                    <FormLabel>Monto Total (con IVA)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-2 gap-4">
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
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
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
                      <FormLabel>Fecha de Término</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
              </div>
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción breve del contrato..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Cancelar
                    </Button>
                </DialogClose>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Guardar Contrato</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
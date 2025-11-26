'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import type { Contrato, Estimacion } from '@/lib/types';

const estimacionSchema = z.object({
  tipo: z.enum(['Parcial', 'Liquidación']),
  monto: z.coerce.number().positive('El monto debe ser un número positivo.'),
  observaciones: z.string().optional(),
});

type EstimacionFormData = z.infer<typeof estimacionSchema>;

interface EstimacionesTabProps {
  contract: Contrato;
}

export function EstimacionesTab({ contract }: EstimacionesTabProps) {
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<EstimacionFormData>({
    resolver: zodResolver(estimacionSchema),
    defaultValues: {
      tipo: 'Parcial',
      monto: 0,
      observaciones: '',
    },
  });

  useEffect(() => {
    const fetchEstimaciones = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/estimaciones?contrato_id=${contract.id}`);
        if (!response.ok) {
          throw new Error('Error al cargar las estimaciones.');
        }
        const data = await response.json();
        setEstimaciones(data.estimaciones);
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimaciones();
  }, [contract.id, toast]);

  const onSubmit = async (data: EstimacionFormData) => {
    try {
      const response = await fetch('/api/estimaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, contrato_id: contract.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la estimación.');
      }

      const { estimacion: newEstimacion } = await response.json();
      setEstimaciones(prev => [newEstimacion, ...prev]);
      toast({
        title: 'Estimación Creada',
        description: 'La nueva estimación ha sido guardada.',
        variant: 'success',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error al Guardar',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Agregar Nueva Estimación</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Estimación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Parcial">Parcial</SelectItem>
                        <SelectItem value="Liquidación">Liquidación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalles de la estimación..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Agregar Estimación</Button>
            </form>
          </Form>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Estimaciones Existentes</h3>
          {isLoading ? (
            <p>Cargando estimaciones...</p>
          ) : estimaciones.length > 0 ? (
            <ul className="space-y-4">
              {estimaciones.map(est => (
                <li key={est.id} className="border p-4 rounded-md">
                  <p><strong>Tipo:</strong> {est.tipo}</p>
                  <p><strong>Monto:</strong> ${est.monto.toLocaleString()}</p>
                  {est.observaciones && <p><strong>Observaciones:</strong> {est.observaciones}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay estimaciones para este contrato.</p>
          )}
        </div>
      </div>
    </div>
  );
}

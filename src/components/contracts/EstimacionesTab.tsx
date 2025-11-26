'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import type { Contrato, Estimacion } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, Paperclip, CheckCircle, Clock } from 'lucide-react';
import { EditEstimationModal } from './EditEstimationModal';

const estimacionSchema = z.object({
  tipo: z.enum(['Parcial', 'Liquidación']),
  monto: z.coerce.number().positive('El monto debe ser un número positivo.'),
  observaciones: z.string().optional(),
  evidencia: z.any().optional(),
});

type EstimacionFormData = z.infer<typeof estimacionSchema>;

interface EstimacionesTabProps {
  contract: Contrato;
}

export function EstimacionesTab({ contract }: EstimacionesTabProps) {
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EstimacionFormData>({
    resolver: zodResolver(estimacionSchema),
    defaultValues: { tipo: 'Parcial', monto: 0, observaciones: '' },
  });

  const fetchEstimaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/estimaciones?contrato_id=${contract.id}`);
      if (!response.ok) throw new Error('Error al cargar las estimaciones.');
      const data = await response.json();
      setEstimaciones(data.estimaciones || []);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [contract.id, toast]);

  useEffect(() => {
    fetchEstimaciones();
  }, [fetchEstimaciones]);

  const handleEstimationUpdated = (updatedEstimation: Estimacion) => {
    setEstimaciones(prev => 
      prev.map(est => (est.id === updatedEstimation.id ? updatedEstimation : est))
    );
  };

  const onSubmit = async (data: EstimacionFormData) => {
    setIsSubmitting(true);
    try {
      const evidenciaUrl = data.evidencia && data.evidencia[0] ? `/${data.evidencia[0].name}` : null;
      const response = await fetch('/api/estimaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, contrato_id: contract.id, evidencia: evidenciaUrl }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Error al crear la estimación.');
      const { estimacion: newEstimacion } = await response.json();
      setEstimaciones(prev => [newEstimacion, ...prev]);
      toast({ title: 'Estimación Guardada', variant: 'success' });
      form.reset();
    } catch (error) {
      toast({ title: 'Error al Guardar', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { totalEstimado, saldo } = useMemo(() => {
    const totalEstimado = estimaciones.reduce((acc, est) => acc + parseFloat(String(est.monto)), 0);
    const montoTotal = parseFloat(String(contract.montoConIVA)) || 0;
    const anticipo = parseFloat(String(contract.anticipoMonto)) || 0;
    const saldo = montoTotal - anticipo - totalEstimado;
    return { totalEstimado, saldo };
  }, [estimaciones, contract]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader><CardTitle>Línea de Tiempo Financiera</CardTitle><CardDescription>Registro del anticipo y todas las estimaciones.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Evidencia</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-green-50 dark:bg-green-900/20 font-medium">
                    <TableCell><CheckCircle className="h-4 w-4 mr-2 text-green-600 inline-block"/>Anticipo</TableCell>
                    <TableCell>{formatDate(contract.anticipoFecha)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(parseFloat(String(contract.anticipoMonto)))}</TableCell>
                    <TableCell className="text-center">{contract.anticipoEvidencia ? <a href={contract.anticipoEvidencia} target="_blank"><Paperclip className="h-4 w-4 mx-auto" /></a> : '-'}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                {isLoading && <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>}
                {!isLoading && estimaciones.map(est => (
                    <TableRow key={est.id}>
                        <TableCell><Clock className="h-4 w-4 mr-2 text-muted-foreground inline-block"/>Estimación #{est.numero}</TableCell>
                        <TableCell>{formatDate(est.fecha)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(parseFloat(String(est.monto)))}</TableCell>
                        <TableCell className="text-center">{est.evidencia ? <a href={est.evidencia} target="_blank"><Paperclip className="h-4 w-4 mx-auto"/></a> : '-'}</TableCell>
                        <TableCell className="text-center">
                           <EditEstimationModal estimacion={est} onEstimationUpdated={handleEstimationUpdated} />
                        </TableCell>
                    </TableRow>
                ))}
                {!isLoading && estimaciones.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No hay estimaciones registradas.</TableCell></TableRow>}
              </TableBody>
            </Table>
             <div className="mt-4 pt-4 border-t flex justify-end space-x-8 pr-4">
                <div><p className="text-sm text-muted-foreground">Total Estimado</p><p className="font-bold font-mono text-lg">{formatCurrency(totalEstimado)}</p></div>
                <div><p className="text-sm text-muted-foreground">Saldo Pendiente</p><p className="font-bold font-mono text-lg text-primary">{formatCurrency(saldo)}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader><CardTitle>Agregar Estimación</CardTitle><CardDescription>Añade un nuevo pago.</CardDescription></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="tipo" render={({ field }) => (<FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Parcial">Parcial</SelectItem><SelectItem value="Liquidación">Liquidación</SelectItem></SelectContent></Select><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="monto" render={({ field }) => (<FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="observaciones" render={({ field }) => (<FormItem><FormLabel>Observaciones</FormLabel><FormControl><Textarea placeholder="Detalles..." {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="evidencia" render={({ field: { value, onChange, ...fieldProps } }) => (<FormItem><FormLabel>Evidencia (Opcional)</FormLabel><FormControl><Input {...fieldProps} type="file" onChange={event => onChange(event.target.files)} /></FormControl><FormMessage/></FormItem>)} />
                        <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import type { Contrato } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, AlertTriangle, ShieldCheck, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// --- Componentes de UI Reutilizables ---
const ChecklistItem = ({ id, label, checked, onCheckedChange }: { id: string; label: React.ReactNode; checked: boolean; onCheckedChange: (checked: boolean) => void; }) => (
  <div className="flex items-start space-x-3 py-3 border-b last:border-0">
    <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
    <div className="grid gap-1.5 leading-none"><Label htmlFor={id} className="text-sm font-medium">{label}</Label></div>
  </div>
);

const EvidenciaSection = ({ title }: { title: string }) => (
    <div className="mt-3 pt-3 pl-7 border-t"><Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2"/>Cargar {title}</Button></div>
);

// --- Propiedades del Componente ---
interface CierreContratoProps {
    contract: Contrato;
    onTerminacionConfirmada: (fechaTerminacion: Date) => void;
}

// --- Componente de Cierre de Contrato ---
export function CierreContrato({ contract, onTerminacionConfirmada }: CierreContratoProps) {
    const [state, setState] = useState({
        cartaTerminacion: false,
        fechaTerminacion: undefined as Date | undefined,
        recepcionOC: false,
    });

    const isCompleto = state.cartaTerminacion && state.fechaTerminacion && state.recepcionOC;

    const handleConfirmar = () => {
        if (isCompleto && state.fechaTerminacion) {
            onTerminacionConfirmada(state.fechaTerminacion);
        }
    };

    return (
        <Card className="border-amber-500/50">
            <CardHeader>
                <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-amber-500"/>Fase 3: Cierre de Contrato</CardTitle>
                <CardDescription>Pasos finales para dar por terminado el contrato e iniciar el periodo de garantía.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChecklistItem 
                    id="recepcionOC" 
                    label="Recepción de Orden de Compra (OC) por Liquidación" 
                    checked={state.recepcionOC} 
                    onCheckedChange={(val) => setState(p => ({...p, recepcionOC: val}))} 
                />
                <div className="py-3 border-b">
                    <EvidenciaSection title="Evidencia de Estimación/Liquidación"/>
                </div>
                <div className="flex items-start space-x-3 py-3">
                    <Checkbox 
                        id="cartaTerminacion" 
                        checked={state.cartaTerminacion} 
                        onCheckedChange={(val) => setState(p => ({...p, cartaTerminacion: val}))} 
                        className="mt-1" 
                    />
                    <div className="grid gap-1.5 w-full">
                        <Label htmlFor="cartaTerminacion">Carta de Terminación Firmada</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'} disabled={!state.cartaTerminacion} className={cn('w-[240px] pl-3 text-left font-normal', !state.fechaTerminacion && 'text-muted-foreground')}>
                                    {state.fechaTerminacion ? format(state.fechaTerminacion, 'PPP', {locale: es}) : <span>Fecha de Terminación</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                    locale={es} 
                                    mode="single" 
                                    selected={state.fechaTerminacion} 
                                    onSelect={(date) => setState(p => ({...p, fechaTerminacion: date}))} 
                                    initialFocus 
                                />
                            </PopoverContent>
                        </Popover>
                        {state.cartaTerminacion && <EvidenciaSection title="Carta de Terminación" />}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button disabled={!isCompleto} onClick={handleConfirmar}>
                        <ShieldCheck className="h-4 w-4 mr-2"/>Confirmar Terminación
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

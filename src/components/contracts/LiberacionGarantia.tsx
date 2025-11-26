'use client';

import React, { useState, useMemo } from 'react';
import type { Contrato } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BadgeCheck } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, cn } from '@/lib/utils';

// --- Componentes de UI Reutilizables ---
const ChecklistItem = ({ id, label, checked, onCheckedChange }: { id: string; label: React.ReactNode; checked: boolean; onCheckedChange: (checked: boolean) => void; }) => (
  <div className="flex items-start space-x-3">
    <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
    <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">Marcar esta casilla una vez que el monto retenido haya sido liquidado, después de la fecha de liberación.</p>
    </div>
  </div>
);

const FinancialSummaryLine = ({ label, value, className }: { label: string; value: string; className?: string }) => (
    <div className={cn("flex justify-between items-center py-2", className)}><p className="text-sm text-muted-foreground">{label}</p><p className="text-sm font-mono font-semibold">{value}</p></div>
);

// --- Propiedades del Componente ---
interface LiberacionGarantiaProps {
    contract: Contrato;
    fechaTerminacion: Date;
    onRevertirTerminacion: () => void;
}

// --- Componente de Liberación de Garantía ---
export function LiberacionGarantia({ contract, fechaTerminacion, onRevertirTerminacion }: LiberacionGarantiaProps) {
    const [cobroRetencion, setCobroRetencion] = useState(false);

    const { montoRetenido2, fechaLiberacion } = useMemo(() => {
        const montoTotal = parseFloat(String(contract.montoConIVA || 0));
        const montoRetenido = montoTotal * 0.02;
        const fechaLib = fechaTerminacion ? addDays(fechaTerminacion, 365) : null;
        return { montoRetenido2: montoRetenido, fechaLiberacion: fechaLib };
    }, [contract.montoConIVA, fechaTerminacion]);

    return (
        <Card className="border-green-500/60 bg-green-50/30">
            <CardHeader>
                <CardTitle className="flex items-center"><BadgeCheck className="h-5 w-5 mr-2 text-green-600"/>Fase 4: Garantía y Liberación</CardTitle>
                <CardDescription>El contrato ha sido terminado. Se ha iniciado el periodo de garantía de 365 días.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 rounded-md bg-background/80 border">
                    <FinancialSummaryLine label="Monto Retenido (2% Garantía)" value={formatCurrency(montoRetenido2)} className="text-lg"/>
                    <div className="my-2 border-t border-dashed"></div>
                    <FinancialSummaryLine label="Fecha de Terminación" value={format(fechaTerminacion, 'PPP', {locale: es})} />
                    <FinancialSummaryLine label="Fecha de Liberación de Garantía" value={fechaLiberacion ? format(fechaLiberacion, 'PPP', {locale: es}) : 'N/A'} />
                </div>
                <div className="mt-6">
                    <ChecklistItem 
                        id="cobroRetencion" 
                        label="Confirmar Cobro de Retención del 2%" 
                        checked={cobroRetencion} 
                        onCheckedChange={setCobroRetencion} 
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={onRevertirTerminacion}>Revertir Terminación</Button>
                </div>
            </CardContent>
        </Card>
    );
}

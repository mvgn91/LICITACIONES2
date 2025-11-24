
'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Estimacion } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

interface AddEstimationModalProps {
  contractId: string;
  remainingBalance: number;
  onAddEstimation: (newEstimation: Omit<Estimacion, 'id' | 'createdAt'>) => void;
}

export function AddEstimationModal({ contractId, remainingBalance, onAddEstimation }: AddEstimationModalProps) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<Estimacion['tipo']>('Liquidación');
  const [monto, setMonto] = useState(String(remainingBalance));
  const [observaciones, setObservaciones] = useState('');
  const [evidenciaFiles, setEvidenciaFiles] = useState<File[]>([]);
  const [ocRecibida, setOcRecibida] = useState(false);

  useEffect(() => {
    const numericMonto = parseFloat(monto);
    const numericRemaining = parseFloat(remainingBalance.toFixed(2));
    
    if (numericMonto === numericRemaining && numericMonto > 0) {
        setTipo('Liquidación');
    } else {
        setTipo('Parcial');
    }
  }, [monto, remainingBalance]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenciaFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (!monto || !observaciones) return;
    if (tipo === 'Liquidación' && !ocRecibida) return;

    const newEstimation: Omit<Estimacion, 'id' | 'createdAt'> = {
      tipo,
      monto: parseFloat(monto),
      observaciones,
      evidencias: evidenciaFiles.map(file => file.name),
      ocRecibida: tipo === 'Liquidación' ? ocRecibida : false,
    };

    onAddEstimation(newEstimation);

    setOpen(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
        setMonto(String(remainingBalance > 0 ? remainingBalance.toFixed(2) : '0.00'));
        setObservaciones('');
        setEvidenciaFiles([]);
        setOcRecibida(false);
        if (remainingBalance > 0) {
            setTipo('Liquidación');
        } else {
            setTipo('Parcial');
        }
    }
    setOpen(isOpen);
  };

  const isSubmitDisabled = !monto || !observaciones || (tipo === 'Liquidación' && !ocRecibida);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={remainingBalance <= 0}>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Agregar Estimación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Estimación</DialogTitle>
          <DialogDescription>
            El monto por defecto es el saldo restante para liquidar el contrato.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tipo</Label>
                <div className="col-span-3">
                    <Badge variant={tipo === 'Liquidación' ? 'destructive' : 'secondary'}>{tipo}</Badge>
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monto-new" className="text-right">Monto</Label>
                <Input id="monto-new" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="col-span-3" placeholder="$0.00" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observaciones-new" className="text-right">Concepto</Label>
                <Textarea id="observaciones-new" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="col-span-3" placeholder="Descripción de la estimación..." />
            </div>
            {tipo === 'Liquidación' && (
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="oc-recibida" className="text-right">O.C.</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox id="oc-recibida" checked={ocRecibida} onCheckedChange={checked => setOcRecibida(Boolean(checked))} />
                    <label htmlFor="oc-recibida" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Orden de Compra Recibida
                    </label>
                  </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="evidencia-new" className="text-right">Evidencias</Label>
                <Input id="evidencia-new" type="file" onChange={handleFileChange} multiple className="col-span-3 file:text-foreground" />
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitDisabled}>Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Estimacion } from '@/lib/types';
import { Paperclip } from 'lucide-react';

interface EditEstimationModalProps {
  estimation: Estimacion;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedEstimation: Estimacion) => void;
}

export function EditEstimationModal({ estimation, isOpen, onClose, onUpdate }: EditEstimationModalProps) {
  const [tipo, setTipo] = useState(estimation.tipo);
  const [monto, setMonto] = useState(String(estimation.monto));
  const [observaciones, setObservaciones] = useState(estimation.observaciones || '');
  const [newEvidenciaFile, setNewEvidenciaFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
        setTipo(estimation.tipo);
        setMonto(String(estimation.monto));
        setObservaciones(estimation.observaciones || '');
        setNewEvidenciaFile(null);
    }
  }, [isOpen, estimation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewEvidenciaFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // In a real app, if newEvidenciaFile exists, you would upload it here
    // and get back a URL. For now, we just use the file name.
    const newEvidencias = newEvidenciaFile 
      ? [newEvidenciaFile.name] 
      : estimation.evidencias;

    const updatedEstimation: Estimacion = {
      ...estimation,
      tipo,
      monto: parseFloat(monto) || 0,
      observaciones,
      evidencias: newEvidencias,
    };
    onUpdate(updatedEstimation);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Estimación</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo-edit" className="text-right">Tipo</Label>
            <Select onValueChange={(value) => setTipo(value as Estimacion['tipo'])} value={tipo}>
              <SelectTrigger id="tipo-edit" className="col-span-3">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parcial">Parcial</SelectItem>
                <SelectItem value="Total">Total</SelectItem>
                <SelectItem value="Liquidación">Liquidación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monto-edit" className="text-right">Monto</Label>
            <Input id="monto-edit" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="observaciones-edit" className="text-right">Observaciones</Label>
            <Textarea id="observaciones-edit" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="evidencia-edit" className="text-right">Evidencia</Label>
            <div className="col-span-3 space-y-2">
                {estimation.evidencias && estimation.evidencias.length > 0 && !newEvidenciaFile && (
                    <div className="text-sm text-muted-foreground flex items-center">
                        <Paperclip className="h-4 w-4 mr-2"/>
                        <span>{estimation.evidencias[0]}</span>
                    </div>
                )}
                <Input id="evidencia-edit" type="file" onChange={handleFileChange} className="file:text-foreground" placeholder="Reemplazar evidencia..."/>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

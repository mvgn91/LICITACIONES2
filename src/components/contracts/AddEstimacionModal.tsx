'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react';

// Schema de validación no cambia
const estimacionSchema = z.object({
  monto: z.preprocess(
    (val) => Number(String(val).replace(/[^0-9.-]+/g, '')),
    z.number().positive({ message: 'El monto debe ser un número positivo.' })
  ),
  observaciones: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
});

type EstimacionFormData = z.infer<typeof estimacionSchema>;

interface AddEstimacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEstimacionAdded: (newEstimacion: any) => void;
  contractId: string;
}

export function AddEstimacionModal({ isOpen, onClose, onEstimacionAdded, contractId }: AddEstimacionModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EstimacionFormData>({
    resolver: zodResolver(estimacionSchema),
  });

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      const validFiles = Array.from(newFiles).filter(file => file.size > 0);
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    setFiles([]);
    setError(null);
    onClose();
  }

  const onSubmit = async (data: EstimacionFormData) => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('monto', data.monto.toString());
    formData.append('observaciones', data.observaciones);
    files.forEach(file => {
      formData.append('evidencias', file);
    });

    try {
      const response = await fetch(`/api/contracts/${contractId}/estimaciones`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falló la creación de la estimación');
      }

      const newEstimacion = await response.json();
      onEstimacionAdded(newEstimacion); // Se actualiza el modal de detalles
      handleClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Estimación</DialogTitle>
          <DialogDescription>
            Completa los detalles de la estimación. El monto se descontará del saldo del contrato.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="monto">Monto de la Estimación</Label>
            <Input id="monto" type="number" placeholder="$5,000.00" {...register('monto')} disabled={isSubmitting} />
            {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto.message}</p>}
          </div>
          <div>
            <Label htmlFor="observaciones">Descripción del Avance</Label>
            <Textarea id="observaciones" placeholder="Ej: Avance en la instalación de acabados..." {...register('observaciones')} disabled={isSubmitting}/>
            {errors.observaciones && <p className="text-red-500 text-xs mt-1">{errors.observaciones.message}</p>}
          </div>
          <div>
            <Label>Evidencia (Opcional)</Label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-muted-foreground">Arrastra y suelta archivos aquí, o haz clic.</p>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={e => handleFileChange(e.target.files)} disabled={isSubmitting} />
              </div>
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Archivos cargados:</p>
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <div className="flex items-center min-w-0">
                      <FileIcon className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0"/>
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(i)} disabled={isSubmitting}><X className="h-4 w-4"/></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm font-medium">Error: {error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : 'Guardar Estimación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

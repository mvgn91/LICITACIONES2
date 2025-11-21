
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UploadCloud, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import { Textarea } from '../ui/textarea';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';

const storage = getStorage(app);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

const estimationSchema = z.object({
  observaciones: z.string().min(1, 'La observación es requerida'),
  monto: z.coerce.number().min(0, 'El monto debe ser positivo'),
  file: z.any()
    .optional()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, `El tamaño máximo del archivo es 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file?.type),
      "Solo se aceptan archivos .jpg, .jpeg, .png, .webp y .pdf."
    ),
});

type EstimationFormValues = z.infer<typeof estimationSchema>;

export function AddEstimationModal({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const firestore = useFirestore();

  const form = useForm<EstimationFormValues>({
    resolver: zodResolver(estimationSchema),
    defaultValues: {
      observaciones: '',
      monto: 0,
    },
  });

  const onSubmit = (data: EstimationFormValues) => {
    startTransition(async () => {
      let evidenceUrl = '';
      if (data.file) {
        const storageRef = ref(storage, `contracts/${contractId}/estimations/${Date.now()}_${data.file.name}`);
        try {
          const snapshot = await uploadBytes(storageRef, data.file);
          evidenceUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
          console.error("Error uploading file:", error);
          toast({ title: 'Error de Carga', description: 'No se pudo subir el archivo de evidencia.', variant: 'destructive' });
          return;
        }
      }
      
      const estimationData = {
          tipo: 'Parcial' as const,
          monto: data.monto,
          observaciones: data.observaciones,
          isCompleted: false,
          createdAt: serverTimestamp(),
          evidencias: evidenceUrl ? [evidenceUrl] : [],
      };
      
      const collectionRef = collection(firestore, `contratos/${contractId}/estimaciones`);

      await addDocumentNonBlocking(collectionRef, estimationData);
      
      toast({ title: 'Éxito', description: 'Estimación agregada correctamente.' });
      setOpen(false);
      form.reset();
      setFileName('');
    });
  };
  
    const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
        setFileName('');
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Agregar Estimación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Agregar Nueva Estimación</DialogTitle>
          <DialogDescription>
            Agregue una nueva tarea o item a este contrato.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Instalación de encimeras de cocina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...rest }}) => (
                <FormItem>
                  <FormLabel>Archivo de Evidencia (Opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="file-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                          setFileName(file ? file.name : '');
                        }}
                        {...rest}
                      />
                      <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                        {fileName ? (
                            <div className="flex items-center text-sm text-foreground">
                                <FileIcon className="w-5 h-5 mr-2"/>
                                <span className="font-medium truncate max-w-[200px]">{fileName}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                                <UploadCloud className="w-8 h-8"/>
                                <span className="mt-1 text-sm">Click para subir</span>
                            </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Agregando...' : 'Agregar Estimación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

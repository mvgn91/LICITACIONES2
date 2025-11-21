'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UploadCloud, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addEstimation } from '@/app/actions';
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

const estimationSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  file: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png, .webp and .pdf files are accepted."
    ).optional(),
});

type EstimationFormValues = z.infer<typeof estimationSchema>;

export function AddEstimationModal({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EstimationFormValues>({
    resolver: zodResolver(estimationSchema),
    defaultValues: {
      description: '',
      amount: 0,
    },
  });

  const onSubmit = (data: EstimationFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('amount', String(data.amount));
      if (data.file) {
        formData.append('file', data.file);
      }
      
      const result = await addEstimation(contractId, null, formData);

      if (result.message.includes('success')) {
        toast({ title: 'Success', description: result.message });
        setOpen(false);
        form.reset();
        setFileName('');
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Add Estimation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Estimation</DialogTitle>
          <DialogDescription>
            Add a new task or item to this contract.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kitchen countertop installation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence File (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="file-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                          setFileName(file ? file.name : '');
                        }}
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
                                <span className="mt-1 text-sm">Click to upload</span>
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
                {isPending ? 'Adding...' : 'Add Estimation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

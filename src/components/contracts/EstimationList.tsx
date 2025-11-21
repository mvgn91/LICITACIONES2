'use client';

import { useTransition } from 'react';
import type { Estimation } from '@/lib/types';
import { updateEstimationStatus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { FileDown, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface EstimationListProps {
  contractId: string;
  estimations: Estimation[];
}

export function EstimationList({ contractId, estimations }: EstimationListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (estimationId: string, isCompleted: boolean) => {
    startTransition(async () => {
      try {
        await updateEstimationStatus(contractId, estimationId, isCompleted);
        toast({
          title: 'Status Updated',
          description: 'Estimation status has been saved.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update status. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  if (estimations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No estimations have been added to this contract yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estimations.map((estimation) => {
        const isImage = estimation.evidencias[0]?.match(/\.(jpeg|jpg|gif|png)$/) != null;
        return (
            <Card
            key={estimation.id}
            className={cn(
                'flex items-center p-4 transition-colors duration-200',
                estimation.isCompleted ? 'bg-muted/50' : 'bg-card'
            )}
            >
            <Checkbox
                id={`estimation-${estimation.id}`}
                checked={estimation.isCompleted}
                onCheckedChange={(checked) => handleStatusChange(estimation.id, !!checked)}
                className="mr-4 h-5 w-5"
                disabled={isPending}
                aria-label={`Mark estimation ${estimation.description} as completed`}
            />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label
                    htmlFor={`estimation-${estimation.id}`}
                    className={cn('font-medium leading-none cursor-pointer', estimation.isCompleted && 'line-through text-muted-foreground')}
                >
                    {estimation.description}
                </label>
                <Badge variant="outline" className="w-fit justify-self-start md:justify-self-center">{formatCurrency(estimation.amount)}</Badge>

                {estimation.evidencias && estimation.evidencias[0] && (
                     <Link href={estimation.evidencias[0]} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center justify-self-start md:justify-self-end">
                        {isImage ? <ImageIcon className="mr-2 h-4 w-4" /> : <FileDown className="mr-2 h-4 w-4" />}
                        View Evidence
                    </Link>
                )}
            </div>
            </Card>
        )}
      )}
    </div>
  );
}

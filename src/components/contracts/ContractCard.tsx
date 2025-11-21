import Link from 'next/link';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Calendar,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import type { Contract } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface ContractCardProps {
  contract: Contract;
}

export function ContractCard({ contract }: ContractCardProps) {
  const progressColor = contract.progress < 100 ? 'bg-accent' : 'bg-green-500';

  return (
    <Link href={`/contracts/${contract.id}`} className="block transition-transform duration-200 hover:scale-[1.02]">
      <Card className="flex h-full flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="font-headline text-2xl truncate">{contract.clientName}</CardTitle>
          <CardDescription className="flex items-center pt-1">
            <Users className="mr-2 h-4 w-4" />
            <span>{contract.address}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              Contract Date: {format(contract.contractDate.toDate(), 'PPP')}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Total: {formatCurrency(contract.totalAmount)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <div className="flex w-full justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span className="font-semibold text-foreground">{contract.progress}%</span>
          </div>
          <Progress value={contract.progress} className={`h-2 [&>div]:${progressColor}`} />
          <div className="mt-2 flex w-full items-center justify-end text-sm font-medium text-accent">
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

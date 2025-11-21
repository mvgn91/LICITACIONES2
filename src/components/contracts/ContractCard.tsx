
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import type { Contrato } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface ContractCardProps {
  contract: Contrato;
  progress: number; // Progress is now passed as a prop
}

export function ContractCard({ contract, progress }: ContractCardProps) {
  const progressColor = progress < 100 ? 'bg-accent' : 'bg-green-500';

  // Safely convert Firestore Timestamp to Date
  const getFormattedDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), 'PPP', { locale: es });
    }
    if (timestamp && !isNaN(new Date(timestamp).getTime())) {
        return format(new Date(timestamp), 'PPP', { locale: es });
    }
    return 'Fecha no disponible';
  };

  return (
    <Link href={`/contracts/${contract.id}`} className="block transition-transform duration-200 hover:scale-[1.02]">
      <Card className="flex h-full flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-card">
        <CardHeader>
          <div className='flex justify-between items-start'>
            <CardTitle className="font-headline text-2xl truncate">{contract.nombre}</CardTitle>
            <Badge className={`${contract.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-500'}`}>{contract.estado}</Badge>
          </div>
          <CardDescription className="flex items-center pt-1">
            <Users className="mr-2 h-4 w-4" />
            <span>{contract.cliente}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              Fecha de Inicio: {getFormattedDate(contract.fechaInicio)}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Monto Total (IVA incl.): {formatCurrency(contract.montoConIVA)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <div className="flex w-full justify-between text-sm text-muted-foreground">
            <span>Progreso</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className={`h-2 [&>div]:${progressColor}`} />
          <div className="mt-2 flex w-full items-center justify-end text-sm font-medium text-accent">
            Ver Detalles <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

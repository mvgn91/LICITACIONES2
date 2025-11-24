
import { Badge } from '@/components/ui/badge';
import type { Estado } from '@/lib/types';
import { CheckCircle, Clock, CircleOff } from 'lucide-react';

interface ContractStatusBadgeProps {
  status: Estado;
}

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  const statusConfig = {
    Activo: {
      variant: 'secondary',
      icon: <Clock className="-ml-1 mr-1.5 h-3 w-3" />,
      label: 'Activo',
      className: 'text-foreground'
    },
    Cerrado: {
      variant: 'outline',
      icon: <CircleOff className="-ml-1 mr-1.5 h-3 w-3" />,
      label: 'Cerrado',
      className: 'text-muted-foreground'
    },
    Terminado: {
        variant: 'default',
        icon: <CheckCircle className="-ml-1 mr-1.5 h-3 w-3" />,
        label: 'Terminado',
        className: 'bg-green-600 hover:bg-green-700 text-green-50'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

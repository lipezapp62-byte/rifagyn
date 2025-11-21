import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: 'pending' | 'paid' | 'expired';
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = {
    pending: {
      label: 'Pendente',
      className: 'bg-pending text-white border-pending',
    },
    paid: {
      label: 'Pago',
      className: 'bg-paid text-white border-paid',
    },
    expired: {
      label: 'Expirado',
      className: 'bg-expired text-white border-expired',
    },
  };
  
  const { label, className: statusClass } = config[status];
  
  return (
    <Badge className={cn(statusClass, className)}>
      {label}
    </Badge>
  );
}

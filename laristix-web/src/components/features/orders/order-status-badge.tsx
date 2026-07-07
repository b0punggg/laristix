import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTransactionStatusDisplay } from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";

interface OrderStatusBadgeProps {
  order: CheckoutOrder;
  className?: string;
}

export function OrderStatusBadge({ order, className }: OrderStatusBadgeProps) {
  const status = getTransactionStatusDisplay(order);

  return (
    <Badge
      variant={status.badgeVariant}
      className={cn("gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", className)}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status.label}
    </Badge>
  );
}

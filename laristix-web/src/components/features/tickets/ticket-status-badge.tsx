import { Badge } from "@/components/ui/badge";
import type { TicketTypeStatus } from "@/types/ticket";

const statusConfig: Record<
  TicketTypeStatus,
  { label: string; variant: "success" | "muted" | "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "success" },
  sold_out: { label: "Sold out", variant: "outline" },
  hidden: { label: "Hidden", variant: "muted" },
  archived: { label: "Archived", variant: "secondary" },
};

interface TicketStatusBadgeProps {
  status: TicketTypeStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

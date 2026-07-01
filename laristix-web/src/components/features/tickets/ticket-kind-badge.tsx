import { Badge } from "@/components/ui/badge";
import type { TicketKind } from "@/types/ticket";

const kindConfig: Record<
  TicketKind,
  { label: string; variant: "muted" | "default" | "warning" }
> = {
  free: { label: "Free", variant: "muted" },
  paid: { label: "Paid", variant: "default" },
  vip: { label: "VIP", variant: "warning" },
};

interface TicketKindBadgeProps {
  kind: TicketKind;
}

export function TicketKindBadge({ kind }: TicketKindBadgeProps) {
  const config = kindConfig[kind];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/types/event";

const statusConfig: Record<
  EventStatus,
  { label: string; variant: "muted" | "success" | "warning" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "muted" },
  published: { label: "Published", variant: "success" },
  live: { label: "Live", variant: "warning" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

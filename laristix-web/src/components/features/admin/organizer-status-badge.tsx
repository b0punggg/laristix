import { Badge } from "@/components/ui/badge";
import type { OrganizerStatus } from "@/types/organizer";

const statusConfig: Record<
  OrganizerStatus,
  { label: string; variant: "muted" | "success" | "warning" | "secondary" | "outline" }
> = {
  pending: { label: "Pending", variant: "warning" },
  active: { label: "Active", variant: "success" },
  suspended: { label: "Suspended", variant: "outline" },
  archived: { label: "Archived", variant: "muted" },
};

interface OrganizerStatusBadgeProps {
  status: OrganizerStatus;
}

export function OrganizerStatusBadge({ status }: OrganizerStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

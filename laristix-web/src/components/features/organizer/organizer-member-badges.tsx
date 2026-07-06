"use client";

import { Badge } from "@/components/ui/badge";
import { organizerMemberRoleLabel, organizerMemberStatusLabel } from "@/lib/organizer-member-labels";
import type { OrganizerMemberRole, OrganizerMemberStatus } from "@/types/organizer";

export function OrganizerMemberRoleBadge({ role }: { role: OrganizerMemberRole }) {
  const variant =
    role === "owner" ? "default" : role === "admin" ? "secondary" : "outline";

  return <Badge variant={variant}>{organizerMemberRoleLabel(role)}</Badge>;
}

export function OrganizerMemberStatusBadge({ status }: { status: OrganizerMemberStatus }) {
  const variant =
    status === "active" ? "success" : status === "pending" ? "warning" : "muted";

  return <Badge variant={variant}>{organizerMemberStatusLabel(status)}</Badge>;
}

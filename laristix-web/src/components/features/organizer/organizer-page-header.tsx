"use client";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

interface OrganizerPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
};

export function OrganizerPageHeader({ title, description, actions }: OrganizerPageHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const role = user?.active_membership?.role;
  const roleLabel = role ? roleLabels[role] ?? role : null;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {roleLabel ? (
            <Badge variant="secondary" className="text-[10px]">
              {roleLabel}
            </Badge>
          ) : null}
        </div>
        {user?.active_organizer ? (
          <p className="text-sm font-medium text-foreground">{user.active_organizer.name}</p>
        ) : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

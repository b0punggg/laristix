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
  scanner: "Scanner",
};

export function OrganizerPageHeader({ title, description, actions }: OrganizerPageHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const role = user?.active_membership?.role;
  const roleLabel = role ? (roleLabels[role] ?? role) : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {roleLabel ? (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {roleLabel}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

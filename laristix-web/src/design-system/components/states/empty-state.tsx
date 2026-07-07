import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/primitives/text";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DsEmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-surface px-6 py-16 text-center",
        className,
      )}
      role="status"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <Text variant="h4">{title}</Text>
      {description ? (
        <Text variant="caption" className="mt-2 max-w-sm">
          {description}
        </Text>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

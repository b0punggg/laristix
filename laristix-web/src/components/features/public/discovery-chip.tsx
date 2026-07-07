"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoveryChipProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

export function DiscoveryChip({ label, icon: Icon, active, badge, onClick }: DiscoveryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Filter ${label}`}
      aria-pressed={active ?? false}
      className={cn(
        "ds-focus-ring flex w-24 shrink-0 flex-col items-center gap-2.5 rounded-2xl border px-3 py-4 transition-all duration-300",
        active
          ? "scale-[1.02] border-brand bg-brand-muted text-brand shadow-md"
          : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm",
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-xl transition-all duration-300",
          active
            ? "bg-brand text-brand-foreground shadow-sm"
            : "bg-muted text-muted-foreground group-hover:bg-brand-muted",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="w-full truncate text-center text-xs font-semibold">{label}</span>
      {badge !== undefined && badge > 0 ? (
        <span className="text-[10px] font-medium text-muted-foreground">{badge} event</span>
      ) : null}
    </button>
  );
}

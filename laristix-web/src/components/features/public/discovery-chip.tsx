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
        "storefront-focus-ring flex shrink-0 flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-all duration-200",
        active
          ? "scale-105 border-brand bg-brand-muted text-brand shadow-sm"
          : "border-border bg-background hover:border-brand/40 hover:bg-muted/50",
      )}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full transition-colors",
          active ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="max-w-[72px] truncate text-xs font-medium">{label}</span>
      {badge !== undefined && badge > 0 ? (
        <span className="text-[10px] text-muted-foreground">{badge} event</span>
      ) : null}
    </button>
  );
}

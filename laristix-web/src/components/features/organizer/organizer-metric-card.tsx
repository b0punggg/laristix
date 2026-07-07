"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/design-system/primitives/text";
import { cn } from "@/lib/utils";

interface OrganizerMetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "brand" | "emerald" | "violet" | "amber" | "sky" | "rose";
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
}

const accentClasses = {
  brand: "bg-brand-muted text-brand",
  emerald: "bg-emerald-500/10 text-emerald-600",
  violet: "bg-violet-500/10 text-violet-600",
  amber: "bg-amber-500/10 text-amber-600",
  sky: "bg-sky-500/10 text-sky-600",
  rose: "bg-rose-500/10 text-rose-600",
};

export function OrganizerMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "brand",
  isLoading,
  isError,
  className,
}: OrganizerMetricCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <Text variant="overline" className="text-muted-foreground">
              {label}
            </Text>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-28" />
                {hint ? <Skeleton className="h-3 w-36" /> : null}
              </div>
            ) : isError ? (
              <p className="text-sm text-destructive">Gagal memuat</p>
            ) : (
              <>
                <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {value}
                </p>
                {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
              </>
            )}
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              accentClasses[accent],
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrganizerMetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="size-11 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

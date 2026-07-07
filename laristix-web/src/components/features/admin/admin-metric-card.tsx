"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  isError?: boolean;
}

export function AdminMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  isError,
}: AdminMetricCardProps) {
  return (
    <Card className="overflow-hidden rounded-3xl border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-28" />
            {subtitle ? <Skeleton className="h-3 w-36" /> : null}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load</p>
        ) : (
          <>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle ? <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p> : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminMetricCardSkeleton() {
  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}

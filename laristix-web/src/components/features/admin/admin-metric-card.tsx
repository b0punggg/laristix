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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
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
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminMetricCardSkeleton() {
  return (
    <Card>
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

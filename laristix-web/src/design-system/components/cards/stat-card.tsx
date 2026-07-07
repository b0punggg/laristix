import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/design-system/primitives/text";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  trend?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, icon, trend, className }: StatCardProps) {
  return (
    <Card variant="default" className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Text variant="caption" className="font-medium uppercase tracking-wide">
          {label}
        </Text>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </CardHeader>
      <CardContent>
        <div className="ds-heading-2">{value}</div>
        {hint ? <Text variant="caption" className="mt-1">{hint}</Text> : null}
        {trend ? <div className="mt-2">{trend}</div> : null}
      </CardContent>
    </Card>
  );
}

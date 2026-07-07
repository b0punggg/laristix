import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/design-system/primitives/text";

interface ChartsContainerProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: number | string;
}

export function ChartsContainer({
  title,
  description,
  actions,
  children,
  className,
  height = 320,
}: ChartsContainerProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {title || actions ? (
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            {title ? <CardTitle className="ds-heading-4">{title}</CardTitle> : null}
            {description ? <Text variant="caption" className="mt-1">{description}</Text> : null}
          </div>
          {actions}
        </CardHeader>
      ) : null}
      <CardContent>
        <div style={{ height: typeof height === "number" ? `${height}px` : height }} className="w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-ds-pulse-soft rounded-md bg-muted", className)}
      aria-hidden
      {...props}
    />
  );
}

export { Skeleton };

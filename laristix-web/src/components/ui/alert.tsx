import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative flex gap-3 rounded-lg border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-surface text-foreground",
      info: "border-info/30 bg-info-muted text-foreground",
      success: "border-success/30 bg-success-muted text-foreground",
      warning: "border-warning/30 bg-warning-muted text-foreground",
      danger: "border-danger/30 bg-danger-muted text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

export function Alert({ className, variant, title, children, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <div className="min-w-0 flex-1">
        {title ? <p className="mb-1 font-semibold leading-none">{title}</p> : null}
        <div className="text-sm text-muted-foreground [&_p]:leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

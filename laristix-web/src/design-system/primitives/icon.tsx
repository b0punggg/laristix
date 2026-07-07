import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconSizeClasses, type IconSize } from "@/design-system/tokens/icons";

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  icon: LucideIcon;
  size?: IconSize;
  label?: string;
}

export function Icon({ icon: LucideComponent, size = "md", className, label, ...props }: IconProps) {
  return (
    <LucideComponent
      className={cn(iconSizeClasses[size], "shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      {...props}
    />
  );
}

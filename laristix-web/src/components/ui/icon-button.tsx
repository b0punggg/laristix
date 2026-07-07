import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

const iconButtonVariants = cva("", {
  variants: {
    variant: {
      primary: "",
      secondary: "",
      outline: "",
      ghost: "",
      danger: "",
    },
  },
  defaultVariants: {
    variant: "ghost",
  },
});

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  label: string;
  variant?: VariantProps<typeof iconButtonVariants>["variant"];
  size?: "sm" | "md" | "lg";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, variant = "ghost", size = "md", children, asChild: _asChild, ...props }, ref) => {
    const sizeMap = { sm: "icon-sm", md: "icon", lg: "icon-lg" } as const;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={sizeMap[size]}
        className={cn(iconButtonVariants({ variant }), className)}
        aria-label={label}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
IconButton.displayName = "IconButton";

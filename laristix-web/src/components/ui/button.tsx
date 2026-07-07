import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ds-focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ds-button-text transition-all duration-normal ease-in-out-soft disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        outline:
          "border border-border bg-background hover:bg-muted hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        danger:
          "bg-danger text-danger-foreground shadow-xs hover:bg-danger-hover",
        success:
          "bg-success text-success-foreground shadow-xs hover:bg-success-hover",
        link: "text-brand underline-offset-4 hover:underline",
        /** @deprecated use `primary` — alias for shadcn compat */
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active",
        /** @deprecated use `danger` */
        destructive:
          "bg-danger text-danger-foreground shadow-xs hover:bg-danger-hover",
      },
      size: {
        sm: "h-8 rounded-sm px-3 text-xs [&_svg]:size-3.5",
        md: "h-10 px-4 py-2 [&_svg]:size-4",
        lg: "h-11 rounded-lg px-6 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-4",
        "icon-sm": "size-8 rounded-sm [&_svg]:size-3.5",
        "icon-lg": "size-11 rounded-lg [&_svg]:size-5",
        /** @deprecated use `md` */
        default: "h-10 px-4 py-2 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    const mergedClassName = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      return (
        <Slot
          className={cn(mergedClassName, isDisabled && "pointer-events-none opacity-50")}
          ref={ref}
          aria-busy={loading || undefined}
          aria-disabled={isDisabled || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={mergedClassName}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-ds-spin" aria-hidden /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

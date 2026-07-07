import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const textVariants = cva("", {
  variants: {
    variant: {
      "display-xl": "ds-display-xl",
      "display-lg": "ds-display-lg",
      h1: "ds-heading-1",
      h2: "ds-heading-2",
      h3: "ds-heading-3",
      h4: "ds-heading-4",
      "body-lg": "ds-body-lg",
      "body-md": "ds-body-md",
      "body-sm": "ds-body-sm",
      caption: "ds-caption",
      overline: "ds-overline",
      "button-text": "ds-button-text",
    },
    color: {
      default: "text-foreground",
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      muted: "text-muted-foreground",
      brand: "text-brand",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
    },
    balance: {
      true: "text-balance",
      false: "",
    },
  },
  defaultVariants: {
    variant: "body-md",
    color: "default",
    balance: false,
  },
});

export type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>;

const defaultElement: Partial<Record<TextVariant, keyof JSX.IntrinsicElements>> = {
  "display-xl": "h1",
  "display-lg": "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  overline: "p",
};

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  as?: keyof JSX.IntrinsicElements;
}

export function Text({
  className,
  variant,
  color,
  balance,
  as,
  ...props
}: TextProps) {
  const Component = (as ?? (variant ? defaultElement[variant] : undefined) ?? "p") as "p";

  return (
    <Component className={cn(textVariants({ variant, color, balance }), className)} {...props} />
  );
}

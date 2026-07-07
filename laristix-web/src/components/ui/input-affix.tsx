import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface InputAffixProps extends Omit<React.ComponentProps<typeof Input>, "prefix"> {
  prefixSlot?: React.ReactNode;
  suffixSlot?: React.ReactNode;
}

const InputAffix = React.forwardRef<HTMLInputElement, InputAffixProps>(
  ({ className, prefixSlot, suffixSlot, ...props }, ref) => (
    <div className="relative flex items-center">
      {prefixSlot ? (
        <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">{prefixSlot}</div>
      ) : null}
      <Input
        ref={ref}
        className={cn(prefixSlot && "pl-9", suffixSlot && "pr-9", className)}
        {...props}
      />
      {suffixSlot ? (
        <div className="absolute right-3 flex items-center text-muted-foreground">{suffixSlot}</div>
      ) : null}
    </div>
  ),
);
InputAffix.displayName = "InputAffix";

export { InputAffix };

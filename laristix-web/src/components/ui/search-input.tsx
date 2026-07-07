import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  onSearch?: (value: string) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, onKeyDown, ...props }, ref) => {
    return (
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          className={cn("pl-9", className)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && onSearch) {
              onSearch((event.target as HTMLInputElement).value);
            }
            onKeyDown?.(event);
          }}
          {...props}
        />
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };

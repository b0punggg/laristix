import * as React from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  sticky?: boolean;
}

export function FilterBar({ className, sticky = false, children, ...props }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs sm:flex-row sm:flex-wrap sm:items-center",
        sticky && "sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/90",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean;
}

export function SearchBar({ className, fullWidth = true, children, ...props }: SearchBarProps) {
  return (
    <div
      className={cn("flex items-center gap-2", fullWidth && "w-full sm:max-w-md", className)}
      role="search"
      {...props}
    >
      {children}
    </div>
  );
}

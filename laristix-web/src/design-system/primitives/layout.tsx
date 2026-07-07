import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

const sizeClasses = {
  default: "max-w-container",
  narrow: "max-w-2xl",
  wide: "max-w-screen-2xl",
};

export function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    />
  );
}

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: "mobile" | "tablet" | "desktop";
}

export function Grid({ className, cols = "desktop", ...props }: GridProps) {
  const colClass =
    cols === "mobile"
      ? "grid-cols-4"
      : cols === "tablet"
        ? "grid-cols-4 md:grid-cols-8"
        : "grid-cols-4 md:grid-cols-8 lg:grid-cols-12";

  return (
    <div className={cn("grid gap-4 md:gap-6", colClass, className)} {...props} />
  );
}

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: "start" | "center" | "end" | "stretch";
}

const gapMap: Record<NonNullable<StackProps["gap"]>, string> = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

export function Stack({ className, gap = 4, align = "stretch", ...props }: StackProps) {
  const alignClass =
    align === "center"
      ? "items-center"
      : align === "end"
        ? "items-end"
        : align === "start"
          ? "items-start"
          : "items-stretch";

  return <div className={cn("flex flex-col", gapMap[gap], alignClass, className)} {...props} />;
}

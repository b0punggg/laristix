import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/config/env";

interface AppLogoProps {
  variant?: "default" | "storefront";
  className?: string;
}

export function AppLogo({ variant = "default", className }: AppLogoProps) {
  return (
    <Link
      href={routes.home}
      className={cn(
        "font-bold tracking-tight",
        variant === "storefront"
          ? "text-2xl text-brand sm:text-3xl"
          : "text-xl",
        className,
      )}
    >
      Laristix
    </Link>
  );
}

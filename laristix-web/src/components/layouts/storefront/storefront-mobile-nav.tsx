"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getStorefrontMobileNavItems,
  isStorefrontMobileNavHidden,
} from "@/lib/storefront-nav-items";
import { routes } from "@/config/env";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function StorefrontMobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  if (isStorefrontMobileNavHidden(pathname)) {
    return null;
  }

  const navItems = getStorefrontMobileNavItems(user);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isHome = item.href === routes.home || item.href.startsWith(`${routes.home}?`);
          const isActive = isHome ? pathname === routes.home : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "storefront-focus-ring flex flex-col items-center gap-1 rounded-sm px-1 py-2.5 text-[10px] font-medium",
                isActive ? "text-brand" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

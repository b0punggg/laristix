"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOrganizerMobileNavItems } from "@/lib/organizer-nav-items";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function OrganizerMobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navItems = getOrganizerMobileNavItems(user);
  const gridCols = navItems.length === 3 ? "grid-cols-3" : "grid-cols-5";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className={cn("grid", gridCols)}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-3 text-[10px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground",
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

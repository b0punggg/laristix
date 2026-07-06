"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOrganizerNavItems } from "@/lib/organizer-nav-items";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function OrganizerNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navItems = getOrganizerNavItems(user);

  return (
    <nav className="mt-8 space-y-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

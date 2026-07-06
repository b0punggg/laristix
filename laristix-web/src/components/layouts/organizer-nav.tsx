"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  Calendar,
  LayoutDashboard,
  ScanLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { routes } from "@/config/env";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: routes.organizerDashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: routes.organizerAnalytics, label: "Analitik", icon: BarChart3 },
  { href: routes.organizerEvents, label: "Event", icon: Calendar },
  { href: routes.scanner, label: "Scanner", icon: ScanLine },
  { href: routes.selectOrganizer, label: "Ganti organizer", icon: ArrowLeftRight },
];

export function OrganizerNav() {
  const pathname = usePathname();

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

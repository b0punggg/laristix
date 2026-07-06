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
  { href: routes.organizerDashboard, label: "Home", icon: LayoutDashboard },
  { href: routes.organizerAnalytics, label: "Analitik", icon: BarChart3 },
  { href: routes.organizerEvents, label: "Event", icon: Calendar },
  { href: routes.scanner, label: "Scan", icon: ScanLine },
  { href: routes.selectOrganizer, label: "Ganti", icon: ArrowLeftRight },
];

export function OrganizerMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
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

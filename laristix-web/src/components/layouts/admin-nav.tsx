"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Calendar,
  FileCode2,
  LayoutDashboard,
  LockKeyhole,
  Megaphone,
  PieChart,
  ScrollText,
  Settings,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { routes } from "@/config/env";
import { usePendingOrganizersQuery } from "@/hooks/use-admin-organizers";
import { cn } from "@/lib/utils";

const navItems: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  showPendingBadge?: boolean;
}> = [
  { href: routes.adminDashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: routes.adminAnalytics, label: "Analytics", icon: BarChart3 },
  { href: routes.adminAnalytics, label: "Revenue & Reports", icon: PieChart },
  { href: routes.adminEvents, label: "Events", icon: Calendar },
  { href: routes.adminOrganizers, label: "Organizers", icon: Building2, showPendingBadge: true },
  { href: routes.adminWithdrawals, label: "Withdrawals", icon: Wallet },
  { href: routes.adminSettings, label: "CMS", icon: FileCode2 },
  { href: routes.adminSettings, label: "Notification Templates", icon: Megaphone },
  { href: routes.adminLogs, label: "Logs", icon: ScrollText },
  { href: routes.adminSettings, label: "Permissions", icon: LockKeyhole },
  { href: routes.adminSettings, label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const { data: pending = [] } = usePendingOrganizersQuery();
  const pendingCount = pending.length;

  return (
    <nav className="mt-8 space-y-1.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const showBadge = item.showPendingBadge && pendingCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm transition-colors",
              isActive
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="size-4 shrink-0" />
              {item.label}
            </span>
            {showBadge ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-amber-100 text-amber-800",
                )}
              >
                {pendingCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

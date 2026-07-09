"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList, LayoutTemplate, Pencil, Settings2, Ticket, UserRound, Users } from "lucide-react";
import { routes } from "@/config/env";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { EventStatus } from "@/types/event";
import { cn } from "@/lib/utils";

interface EventSubNavProps {
  eventUuid: string;
  eventStatus?: EventStatus;
  className?: string;
}

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    href: (uuid: string) => routes.organizerEventDashboard(uuid),
    show: () => true,
  },
  {
    key: "tickets",
    label: "Tiket",
    icon: Ticket,
    href: (uuid: string) => routes.organizerEventTickets(uuid),
    show: () => true,
  },
  {
    key: "registration",
    label: "Formulir",
    icon: ClipboardList,
    href: (uuid: string) => routes.organizerEventRegistration(uuid),
    show: () => true,
  },
  {
    key: "attendees",
    label: "Pemesan",
    icon: UserRound,
    href: (uuid: string) => routes.organizerEventAttendees(uuid),
    show: () => true,
  },
  {
    key: "checkout-settings",
    label: "Checkout",
    icon: Settings2,
    href: (uuid: string) => routes.organizerEventCheckoutSettings(uuid),
    show: () => true,
  },
  {
    key: "microsite",
    label: "Halaman",
    icon: LayoutTemplate,
    href: (uuid: string) => routes.organizerEventMicrosite(uuid),
    show: () => true,
  },
  {
    key: "attendance",
    label: "Kehadiran",
    icon: Users,
    href: (uuid: string) => routes.organizerEventAttendance(uuid),
    show: (status?: EventStatus) => status === "published" || status === "live",
  },
  {
    key: "edit",
    label: "Edit",
    icon: Pencil,
    href: (uuid: string) => routes.organizerEventEdit(uuid),
    show: () => true,
    requiresManage: true,
  },
] as const;

export function EventSubNav({ eventUuid, eventStatus, className }: EventSubNavProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const canManage = canManageEvents(user);

  const visibleItems = navItems.filter((item) => {
    if ("requiresManage" in item && item.requiresManage && !canManage) {
      return false;
    }

    return item.show(eventStatus);
  });

  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto rounded-xl border border-border/80 bg-muted/30 p-1 scrollbar-thin",
        className,
      )}
      aria-label="Navigasi event"
    >
      {visibleItems.map((item) => {
        const href = item.href(eventUuid);
        const isActive =
          item.key === "dashboard"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.key}
            href={href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

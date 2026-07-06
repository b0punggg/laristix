import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  Calendar,
  LayoutDashboard,
  ScanLine,
  Users,
} from "lucide-react";
import { routes } from "@/config/env";
import { canManageMembers, isScannerRole } from "@/lib/permissions";
import type { AuthenticatedUser } from "@/types/auth";

export interface OrganizerNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const dashboardItem: OrganizerNavItem = {
  href: routes.organizerDashboard,
  label: "Dashboard",
  icon: LayoutDashboard,
};

const analyticsItem: OrganizerNavItem = {
  href: routes.organizerAnalytics,
  label: "Analitik",
  icon: BarChart3,
};

const eventsItem: OrganizerNavItem = {
  href: routes.organizerEvents,
  label: "Event",
  icon: Calendar,
};

const scannerItem: OrganizerNavItem = {
  href: routes.scanner,
  label: "Scanner",
  icon: ScanLine,
};

const switchOrganizerItem: OrganizerNavItem = {
  href: routes.selectOrganizer,
  label: "Ganti organizer",
  icon: ArrowLeftRight,
};

const teamItem: OrganizerNavItem = {
  href: routes.organizerTeam,
  label: "Tim",
  icon: Users,
};

export function getOrganizerNavItems(user: AuthenticatedUser | null): OrganizerNavItem[] {
  if (isScannerRole(user)) {
    return [dashboardItem, scannerItem, switchOrganizerItem];
  }

  const items: OrganizerNavItem[] = [
    dashboardItem,
    analyticsItem,
    eventsItem,
    scannerItem,
    switchOrganizerItem,
  ];

  if (canManageMembers(user)) {
    return [dashboardItem, teamItem, analyticsItem, eventsItem, scannerItem, switchOrganizerItem];
  }

  return items;
}

export function getOrganizerMobileNavItems(user: AuthenticatedUser | null): OrganizerNavItem[] {
  if (isScannerRole(user)) {
    return [
      { ...dashboardItem, label: "Home" },
      { ...scannerItem, label: "Scan" },
      { ...switchOrganizerItem, label: "Ganti" },
    ];
  }

  return [
    { ...dashboardItem, label: "Home" },
    { ...analyticsItem, label: "Analitik" },
    { ...eventsItem, label: "Event" },
    { ...scannerItem, label: "Scan" },
    { ...switchOrganizerItem, label: "Ganti" },
  ];
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/common/app-logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import { useLogoutMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { AdminNav } from "@/components/layouts/admin-nav";
import { OrganizerMobileNav } from "@/components/layouts/organizer-mobile-nav";
import { OrganizerNav } from "@/components/layouts/organizer-nav";
import { cn } from "@/lib/utils";

export const adminNavItems = [
  { href: routes.adminDashboard, label: "Dashboard" },
  { href: routes.adminEvents, label: "Events" },
  { href: routes.adminOrganizers, label: "Organizers" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  useAdminNav?: boolean;
  useOrganizerNav?: boolean;
}

export function DashboardShell({
  children,
  title,
  useAdminNav = false,
  useOrganizerNav = false,
}: DashboardShellProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 p-4 md:block">
        <AppLogo />
        {useAdminNav ? <AdminNav /> : null}
        {useOrganizerNav ? <OrganizerNav /> : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {user?.active_organizer ? (
              <p className="truncate text-sm text-muted-foreground">{user.active_organizer.name}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground lg:inline">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Keluar
            </Button>
          </div>
        </header>

        <main className={cn("flex-1 p-4 sm:p-6", useOrganizerNav && "pb-24 md:pb-6")}>
          {children}
        </main>
      </div>

      {useOrganizerNav ? <OrganizerMobileNav /> : null}
    </div>
  );
}

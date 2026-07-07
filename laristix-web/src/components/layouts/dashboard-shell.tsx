"use client";

import { OrganizerSidebar } from "@/components/layouts/organizer-sidebar";
import { OrganizerTopbar } from "@/components/layouts/organizer-topbar";
import { AdminNav } from "@/components/layouts/admin-nav";
import { AppLogo } from "@/components/common/app-logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import { useLogoutMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
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

function AdminDashboardShell({ children, title }: { children: React.ReactNode; title: string }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-background/95 p-5 backdrop-blur md:block">
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/60 via-background to-background p-4 shadow-sm">
          <AppLogo className="text-2xl text-brand" />
          <p className="mt-2 text-xs text-muted-foreground">Premium platform control center</p>
        </div>
        <AdminNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Platform Admin</p>
            <h1 className="truncate text-xl font-semibold">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded-2xl border border-border/80 bg-muted/40 px-3 py-2 text-right lg:block">
              <p className="max-w-[14rem] truncate text-sm font-medium">{user?.name ?? "Admin"}</p>
              <p className="max-w-[14rem] truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-xl"
            >
              Keluar
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function OrganizerDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <OrganizerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OrganizerTopbar />
        <main className={cn("flex-1 p-4 sm:p-6 lg:p-8")}>{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  title,
  useAdminNav = false,
  useOrganizerNav = false,
}: DashboardShellProps) {
  if (useOrganizerNav) {
    return <OrganizerDashboardShell>{children}</OrganizerDashboardShell>;
  }

  return <AdminDashboardShell title={title}>{children}</AdminDashboardShell>;
}

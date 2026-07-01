"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/common/app-logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import { useLogoutMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const organizerNavItems = [
  { href: routes.organizerDashboard, label: "Dashboard" },
  { href: routes.organizerEvents, label: "Events" },
  { href: routes.selectOrganizer, label: "Switch organizer" },
];

export const adminNavItems = [
  { href: routes.adminDashboard, label: "Dashboard" },
  { href: routes.adminEvents, label: "Events" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  navItems?: Array<{ href: string; label: string }>;
}

export function DashboardShell({
  children,
  title,
  navItems = organizerNavItems,
}: DashboardShellProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-muted/30 p-4 md:block">
        <AppLogo />
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {user?.active_organizer ? (
              <p className="text-sm text-muted-foreground">{user.active_organizer.name}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

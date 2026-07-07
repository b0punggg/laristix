"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Building2 } from "lucide-react";
import { AppLogo } from "@/components/common/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOrganizerNavItems } from "@/lib/organizer-nav-items";
import { routes } from "@/config/env";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function OrganizerSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navItems = getOrganizerNavItems(user);
  const organizer = user?.active_organizer;

  const initials = organizer?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border/80 bg-card md:flex lg:w-72">
      <div className="border-b border-border/60 px-5 py-5">
        <AppLogo className="text-xl" />
        {organizer ? (
          <div className="mt-5 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
            <Avatar className="size-10 border">
              {organizer.logo_url ? (
                <AvatarImage src={organizer.logo_url} alt={organizer.name} />
              ) : null}
              <AvatarFallback className="bg-brand-muted text-brand">
                {initials ?? <Building2 className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{organizer.name}</p>
              <p className="truncate text-xs text-muted-foreground">Workspace organizer</p>
            </div>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "ds-focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <Link
          href={routes.selectOrganizer}
          className="ds-focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeftRight className="size-4 shrink-0" aria-hidden />
          Ganti organizer
        </Link>
      </div>
    </aside>
  );
}

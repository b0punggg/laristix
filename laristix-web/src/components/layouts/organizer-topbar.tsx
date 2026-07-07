"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  Menu,
  Plus,
  Search,
} from "lucide-react";
import { OrganizerMobileDrawer } from "@/components/layouts/organizer-mobile-drawer";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { routes } from "@/config/env";
import { useLogoutMutation } from "@/hooks/use-auth";
import { useOrganizerDashboardInsightsQuery } from "@/hooks/use-organizer-dashboard";
import { canManageEvents } from "@/lib/permissions";
import { getOrganizerPageTitle } from "@/lib/organizer-page-title";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface OrganizerTopbarProps {
  className?: string;
}

export function OrganizerTopbar({ className }: OrganizerTopbarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insightsQuery = useOrganizerDashboardInsightsQuery(Boolean(user?.active_organizer));
  const attentionCount = insightsQuery.data?.attention_items.length ?? 0;
  const pageTitle = getOrganizerPageTitle(pathname);
  const canCreate = canManageEvents(user);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md sm:px-6",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <IconButton
            variant="ghost"
            size="sm"
            label="Buka menu"
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" />
          </IconButton>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{pageTitle}</p>
            {user?.active_organizer ? (
              <p className="truncate text-xs text-muted-foreground">{user.active_organizer.name}</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Cari event..."
              className="h-9 w-44 rounded-lg border border-border/80 bg-muted/40 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand/50 focus:bg-background lg:w-56"
              onFocus={() => {
                window.location.href = routes.organizerEvents;
              }}
              readOnly
              aria-label="Cari event"
            />
          </div>

          {canCreate ? (
            <Button asChild size="sm" className="hidden bg-brand hover:bg-brand-hover sm:inline-flex">
              <Link href={routes.organizerEventNew}>
                <Plus className="size-4" aria-hidden />
                Event baru
              </Link>
            </Button>
          ) : null}

          <Popover>
            <PopoverTrigger asChild>
              <IconButton variant="ghost" size="sm" label="Notifikasi" className="relative">
                <Bell className="size-5" />
                {attentionCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                    {attentionCount > 9 ? "9+" : attentionCount}
                  </span>
                ) : null}
              </IconButton>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b px-4 py-3">
                <p className="font-semibold text-foreground">Notifikasi</p>
                <p className="text-xs text-muted-foreground">Event yang perlu perhatian</p>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {(insightsQuery.data?.attention_items.length ?? 0) === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                    Tidak ada notifikasi baru
                  </p>
                ) : (
                  insightsQuery.data?.attention_items.map((item) => (
                    <Link
                      key={`${item.type}-${item.event.uuid}`}
                      href={routes.organizerEventEdit(item.event.uuid)}
                      className="block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <p className="font-medium text-foreground">{item.event.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.message}</p>
                    </Link>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="hidden items-center gap-2 border-l border-border/80 pl-2 sm:flex">
            <span className="max-w-[10rem] truncate text-xs text-muted-foreground lg:max-w-[14rem]">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="size-4" aria-hidden />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <OrganizerMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

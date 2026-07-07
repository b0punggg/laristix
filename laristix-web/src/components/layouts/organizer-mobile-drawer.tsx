"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Building2, LogOut } from "lucide-react";
import { AppLogo } from "@/components/common/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getOrganizerNavItems } from "@/lib/organizer-nav-items";
import { routes } from "@/config/env";
import { useLogoutMutation } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface OrganizerMobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizerMobileDrawer({ open, onOpenChange }: OrganizerMobileDrawerProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();
  const navItems = getOrganizerNavItems(user);
  const organizer = user?.active_organizer;

  const initials = organizer?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="left" showClose={false} className="flex h-full max-h-none w-[min(100vw-3rem,18rem)] flex-col rounded-none border-r p-0">
        <DrawerHeader className="border-b px-4 py-4 text-left">
          <DrawerTitle className="sr-only">Menu navigasi</DrawerTitle>
          <AppLogo />
          {organizer ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
              <Avatar className="size-9 border">
                {organizer.logo_url ? (
                  <AvatarImage src={organizer.logo_url} alt={organizer.name} />
                ) : null}
                <AvatarFallback className="bg-brand-muted text-brand text-xs">
                  {initials ?? <Building2 className="size-3.5" />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{organizer.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          ) : null}
        </DrawerHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <DrawerClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </DrawerClose>
            );
          })}
        </nav>

        <DrawerFooter className="gap-2 border-t p-3">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={routes.selectOrganizer}>
                <ArrowLeftRight className="size-4" aria-hidden />
                Ganti organizer
              </Link>
            </Button>
          </DrawerClose>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" aria-hidden />
            Keluar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

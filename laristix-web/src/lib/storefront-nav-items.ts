import type { LucideIcon } from "lucide-react";
import { FileText, Home, Search, Ticket, UserCircle } from "lucide-react";
import { roleRoutes, routes } from "@/config/env";
import type { AuthenticatedUser } from "@/types/auth";

export interface StorefrontNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function getStorefrontMobileNavItems(user: AuthenticatedUser | null): StorefrontNavItem[] {
  const accountHref = user ? (roleRoutes[user.primary_role] ?? routes.myTickets) : routes.login;

  return [
    { href: routes.home, label: "Beranda", icon: Home },
    { href: `${routes.home}?focus=search`, label: "Cari", icon: Search },
    { href: user ? routes.myTickets : routes.loginWithRedirect(routes.myTickets), label: "Tiket", icon: Ticket },
    {
      href: user ? routes.myTransactions : routes.loginWithRedirect(routes.myTransactions),
      label: "Transaksi",
      icon: FileText,
    },
    { href: accountHref, label: user ? "Akun" : "Masuk", icon: UserCircle },
  ];
}

export function isStorefrontMobileNavHidden(pathname: string): boolean {
  return pathname.includes("/checkout");
}

"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FileText, Search, Ticket, UserCircle } from "lucide-react";
import { AppLogo } from "@/components/common/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roleRoutes, routes } from "@/config/env";
import { useLogoutMutation, useMeQuery } from "@/hooks/use-auth";
import { buildHomeUrl, parsePublicDiscoveryFilters } from "@/lib/public-discovery-filters";
import { useAuthStore } from "@/stores/auth-store";

export function StorefrontHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  useMeQuery(isHydrated && user !== null);
  const logoutMutation = useLogoutMutation(routes.home);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const discoveryFilters = useMemo(
    () => parsePublicDiscoveryFilters(searchParams),
    [searchParams],
  );

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      searchInputRef.current?.focus();
    }
  }, [searchParams]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();

    router.replace(
      buildHomeUrl({
        ...discoveryFilters,
        q: trimmed || undefined,
      }),
    );
  };

  const dashboardRoute = user ? (roleRoutes[user.primary_role] ?? routes.home) : routes.login;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center justify-between gap-4 lg:shrink-0">
          <AppLogo variant="storefront" />
          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={dashboardRoute}>
                  <UserCircle className="size-5" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href={routes.login}>Masuk</Link>
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-0">
          <div className="relative flex flex-1">
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari berdasarkan artis, acara, atau nama tempat"
              className="h-11 rounded-r-none border-r-0 pr-4"
            />
          </div>
          <Button
            type="submit"
            className="h-11 rounded-l-none bg-brand px-5 hover:bg-brand-hover"
          >
            <Search className="size-5" />
            <span className="sr-only">Cari</span>
          </Button>
        </form>

        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-700 lg:flex">
          <button
            type="button"
            className="flex items-center gap-1.5 transition-colors hover:text-brand"
          >
            <span className="text-base leading-none">🇮🇩</span>
            <span>ID</span>
            <ChevronDown className="size-4 text-gray-400" />
          </button>

          <Link
            href={user ? routes.myTransactions : routes.loginWithRedirect(routes.myTransactions)}
            className="flex items-center gap-2 transition-colors hover:text-brand"
          >
            <FileText className="size-5 text-gray-500" />
            <span>Transaksi</span>
          </Link>

          <Link
            href={user ? routes.myTickets : routes.loginWithRedirect(routes.myTickets)}
            className="flex items-center gap-2 transition-colors hover:text-brand"
          >
            <Ticket className="size-5 text-gray-500" />
            <span>Tiket</span>
          </Link>

          {user ? (
            <details className="relative group">
              <summary className="flex cursor-pointer list-none items-center gap-2 transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
                <UserCircle className="size-5 text-gray-500" />
                <span className="max-w-[120px] truncate">Profil</span>
                <ChevronDown className="size-4 text-gray-400" />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-white py-1 shadow-lg">
                <p className="border-b px-4 py-2 text-xs text-gray-500">{user.name}</p>
                <Link
                  href={routes.profile}
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Profil
                </Link>
                <Link
                  href={routes.myTransactions}
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Transaksi
                </Link>
                <Link
                  href={routes.myTickets}
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Tiket saya
                </Link>
                <Link
                  href={dashboardRoute}
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Keluar..." : "Keluar"}
                </button>
              </div>
            </details>
          ) : (
            <Link
              href={routes.login}
              className="flex items-center gap-2 transition-colors hover:text-brand"
            >
              <UserCircle className="size-5 text-gray-500" />
              <span>Masuk</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

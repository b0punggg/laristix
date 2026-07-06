"use client";

import { CreditCard, ShieldCheck, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFeaturedOrganizersQuery,
  usePublicPlatformStatsQuery,
} from "@/hooks/use-public-platform";

const PAYMENT_METHODS = ["Midtrans", "QRIS", "GoPay", "ShopeePay", "Bank Transfer"] as const;

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${Math.floor(value / 1000)}rb+`;
  }

  return `${value}+`;
}

export function PublicTrustSection() {
  const statsQuery = usePublicPlatformStatsQuery();
  const organizersQuery = useFeaturedOrganizersQuery();

  const stats = statsQuery.data;
  const organizers = organizersQuery.data ?? [];

  return (
    <section className="storefront-section border-y bg-muted/30 py-12 md:py-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {statsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))
          ) : (
            <>
              <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-brand">
                  {formatCount(stats?.published_events_count ?? 0)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Event dipublikasikan</p>
              </div>
              <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-brand">
                  {formatCount(stats?.organizer_count ?? 0)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Organizer aktif</p>
              </div>
              <div className="flex items-center justify-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                <ShieldCheck className="size-8 shrink-0 text-emerald-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Pembayaran aman</p>
                  <p className="text-xs text-muted-foreground">Diverifikasi Midtrans</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Metode pembayaran didukung</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {!organizersQuery.isLoading && organizers.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Dipercaya organizer</p>
            </div>
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-thin">
              {organizers.map((organizer) => (
                <div
                  key={organizer.uuid}
                  className="flex w-28 shrink-0 flex-col items-center gap-2 rounded-xl border bg-white p-3 text-center shadow-sm"
                >
                  {organizer.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={organizer.logo_url}
                      alt={organizer.name}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {organizer.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <p className="line-clamp-2 text-xs font-medium leading-tight">{organizer.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {organizersQuery.isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="size-28 shrink-0 rounded-xl" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

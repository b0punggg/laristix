"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/env";
import { useMyOrdersQuery } from "@/hooks/use-my-orders";
import { formatEventDateShort } from "@/lib/datetime";
import { useAuthStore } from "@/stores/auth-store";
import type { CheckoutOrder } from "@/types/checkout";

function ContinueOrderCard({ order }: { order: CheckoutOrder }) {
  const event = order.event;
  if (!event) {
    return null;
  }

  return (
    <Link
      href={routes.publicEvent(event.uuid)}
      className="group flex w-[280px] shrink-0 overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md md:w-auto"
    >
      <div className="relative aspect-square w-24 shrink-0 bg-muted sm:w-28">
        {event.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10">
            <Calendar className="size-6 text-primary/40" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {event.title}
        </p>
        {event.start_at && event.timezone ? (
          <p className="text-xs text-muted-foreground">
            {formatEventDateShort(event.start_at, event.timezone)}
          </p>
        ) : null}
        <p className="text-xs capitalize text-muted-foreground">{order.status.replaceAll("_", " ")}</p>
      </div>
    </Link>
  );
}

export function PublicHomeContinueSection() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useMyOrdersQuery(1, 5, Boolean(user));

  if (!user) {
    return null;
  }

  const recentOrders = (data?.data ?? []).filter((order) => order.event);

  if (!isLoading && recentOrders.length === 0) {
    return null;
  }

  return (
    <section className="storefront-section mx-auto max-w-7xl space-y-5 px-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="storefront-section-title">Lanjutkan</h2>
          <p className="storefront-section-subtitle">Event dan transaksi terbaru Anda</p>
        </div>
        <Link
          href={routes.myTickets}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-brand hover:underline"
        >
          Tiket saya
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-[280px] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-thin md:grid md:grid-cols-3 md:overflow-visible">
          {recentOrders.map((order) => (
            <ContinueOrderCard key={order.uuid} order={order} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={routes.myTickets}>
            <Ticket className="size-4" />
            Lihat semua tiket
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.myTransactions}>Riwayat transaksi</Link>
        </Button>
      </div>
    </section>
  );
}

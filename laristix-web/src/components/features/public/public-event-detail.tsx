"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { TicketKindBadge } from "@/components/features/tickets/ticket-kind-badge";
import { routes } from "@/config/env";
import { usePublicEventQuery, usePublicTicketsQuery } from "@/hooks/use-public-events";
import { useMeQuery } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/currency";
import { formatEventDateRange, formatSalesPeriod } from "@/lib/datetime";

interface PublicEventDetailProps {
  uuid: string;
}

function ticketAvailabilityLabel(isPurchasable: boolean, isSoldOut: boolean, isSalesOpen: boolean) {
  if (isSoldOut) {
    return "Habis";
  }

  if (!isSalesOpen) {
    return "Penjualan ditutup";
  }

  if (isPurchasable) {
    return "Tersedia";
  }

  return "Tidak tersedia";
}

export function PublicEventDetail({ uuid }: PublicEventDetailProps) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const storedUser = useAuthStore((s) => s.user);
  const { data: me } = useMeQuery(isHydrated);
  const currentUser = me ?? storedUser;

  const eventQuery = usePublicEventQuery(uuid);
  const ticketsQuery = usePublicTicketsQuery(uuid, Boolean(eventQuery.data));

  const event = eventQuery.data;
  const tickets = ticketsQuery.data ?? [];

  if (eventQuery.isLoading) {
    return <p className="text-muted-foreground">Memuat detail event...</p>;
  }

  if (eventQuery.isError || !event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href={routes.home}>
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <p className="font-medium">Event tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Event mungkin belum dipublikasikan atau tidak tersedia untuk publik.
          </p>
        </div>
      </div>
    );
  }

  const venueLabel = [event.venue?.name, event.venue?.city].filter(Boolean).join(", ");

  return (
    <div className="space-y-8">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href={routes.home}>
          <ArrowLeft className="size-4" />
          Semua event
        </Link>
      </Button>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative aspect-[21/9] bg-muted">
          {event.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Calendar className="size-16 text-primary/30" />
            </div>
          )}
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={event.status} />
            {event.is_free ? <Badge variant="success">Gratis</Badge> : null}
            {event.category ? <Badge variant="secondary">{event.category.name}</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>
          {event.organizer ? (
            <p className="text-muted-foreground">Diselenggarakan oleh {event.organizer.name}</p>
          ) : null}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            <p className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              {formatEventDateRange(event.start_at, event.end_at, event.timezone)}
            </p>
            {venueLabel ? (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {venueLabel}
              </p>
            ) : null}
          </div>
          {event.short_description ? (
            <p className="text-lg text-muted-foreground">{event.short_description}</p>
          ) : null}
          {event.description ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
              {event.description}
            </div>
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Ticket className="size-5" />
          <h2 className="text-2xl font-bold tracking-tight">Tiket</h2>
        </div>

        {ticketsQuery.isLoading ? (
          <p className="text-muted-foreground">Memuat tiket...</p>
        ) : null}

        {ticketsQuery.isError ? (
          <p className="text-sm text-destructive">Gagal memuat daftar tiket.</p>
        ) : null}

        {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Belum ada tiket yang dipublikasikan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tiket dengan visibility publik akan ditampilkan di sini.
            </p>
          </div>
        ) : null}

        {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tickets.map((ticket) => {
              const availability = ticketAvailabilityLabel(
                ticket.is_purchasable,
                ticket.is_sold_out,
                ticket.is_sales_open,
              );
              const canSelect = ticket.is_purchasable;
              const checkoutUrl = routes.publicEventCheckout(uuid, ticket.id);
              const ticketActionHref = currentUser
                ? checkoutUrl
                : routes.loginWithRedirect(checkoutUrl);

              return (
                <Card key={ticket.id}>
                  <CardHeader className="space-y-2 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">{ticket.name}</CardTitle>
                      <TicketKindBadge kind={ticket.kind} />
                    </div>
                    <p className="text-2xl font-bold">
                      {ticket.is_free ? "Gratis" : formatCurrency(ticket.price, ticket.currency)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ticket.description ? (
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    ) : null}
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Ketersediaan</dt>
                        <dd className="font-medium">{availability}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Sisa kuota</dt>
                        <dd className="font-medium">
                          {ticket.available_quantity} / {ticket.quantity}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Per pesanan</dt>
                        <dd className="font-medium">
                          {ticket.min_per_order}–{ticket.max_per_order} tiket
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Periode penjualan</dt>
                        <dd className="text-right font-medium">
                          {formatSalesPeriod(ticket.sales_start_at, ticket.sales_end_at)}
                        </dd>
                      </div>
                    </dl>
                    <Button className="w-full" disabled={!canSelect} asChild={canSelect}>
                      {canSelect ? (
                        <Link href={ticketActionHref}>
                          {currentUser ? "Pilih tiket" : "Masuk untuk beli tiket"}
                        </Link>
                      ) : (
                        <span>{availability}</span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

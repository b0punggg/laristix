"use client";

import Link from "next/link";
import { Building2, Calendar, MapPin, Share2, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicEventFavoriteButton } from "@/components/features/public/public-event-favorite-button";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import { formatCurrency } from "@/lib/currency";
import { formatEventDateShort } from "@/lib/datetime";
import { formatVenueAddress } from "@/lib/event-page-content";
import type { Event } from "@/types/event";
import type { TicketType } from "@/types/ticket";

interface PublicEventDetailPurchaseCardProps {
  event: Event;
  tickets: TicketType[];
  currentUser: { id: number } | null | undefined;
  checkoutHref: string | null;
  ctaLabel: string;
  ctaDisabled: boolean;
  className?: string;
}

function getDisplayPrice(event: Event, tickets: TicketType[]): string {
  const purchasable = tickets.filter((ticket) => ticket.is_purchasable);

  if (purchasable.length > 0) {
    const cheapest = purchasable.reduce((min, ticket) =>
      ticket.price < min.price ? ticket : min,
    );

    return cheapest.is_free ? "Gratis" : `Mulai ${formatCurrency(cheapest.price, cheapest.currency)}`;
  }

  if (event.is_free) {
    return "Gratis";
  }

  if (event.min_ticket_price && event.min_ticket_price > 0) {
    return `Mulai ${formatCurrency(event.min_ticket_price)}`;
  }

  return "Harga segera hadir";
}

export function PublicEventDetailPurchaseCard({
  event,
  tickets,
  currentUser,
  checkoutHref,
  ctaLabel,
  ctaDisabled,
  className,
}: PublicEventDetailPurchaseCardProps) {
  const venueLabel = formatVenueAddress(event.venue);
  const priceLabel = getDisplayPrice(event, tickets);
  const ticketCount = tickets.filter((ticket) => ticket.is_purchasable).length;

  return (
    <Card className={className}>
      <CardContent className="space-y-5 p-5">
        <div className="space-y-1">
          <Text variant="overline" className="text-brand">
            Tiket Event
          </Text>
          <p className="text-2xl font-bold tracking-tight text-foreground">{priceLabel}</p>
          {ticketCount > 0 ? (
            <p className="text-sm text-muted-foreground">{ticketCount} jenis tiket tersedia</p>
          ) : null}
        </div>

        <div className="space-y-3 border-y border-border/70 py-4">
          <div className="flex items-start gap-3 text-sm">
            <Calendar className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="font-medium text-foreground">Tanggal</p>
              <p className="text-muted-foreground">
                {formatEventDateShort(event.start_at, event.timezone)}
              </p>
            </div>
          </div>
          {venueLabel ? (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <div>
                <p className="font-medium text-foreground">Lokasi</p>
                <p className="text-muted-foreground">{venueLabel}</p>
              </div>
            </div>
          ) : null}
        </div>

        {checkoutHref && !ctaDisabled ? (
          <Button className="w-full bg-brand hover:bg-brand-hover" size="lg" asChild>
            <Link href={checkoutHref}>{ctaLabel}</Link>
          </Button>
        ) : (
          <Button className="w-full" size="lg" disabled={ctaDisabled} asChild={!ctaDisabled}>
            {ctaDisabled ? (
              <span>{ctaLabel}</span>
            ) : (
              <a href="#tickets">{ctaLabel}</a>
            )}
          </Button>
        )}

        {!currentUser && tickets.some((ticket) => ticket.is_purchasable) ? (
          <p className="text-center text-xs text-muted-foreground">
            <Link href={routes.login} className="font-medium text-brand hover:underline">
              Masuk
            </Link>{" "}
            untuk checkout lebih cepat
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface PublicEventDetailMobilePurchaseBarProps {
  event: Event;
  tickets: TicketType[];
  checkoutHref: string | null;
  ctaLabel: string;
  ctaDisabled: boolean;
}

export function PublicEventDetailMobilePurchaseBar({
  event,
  tickets,
  checkoutHref,
  ctaLabel,
  ctaDisabled,
}: PublicEventDetailMobilePurchaseBarProps) {
  const priceLabel = getDisplayPrice(event, tickets);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
          <p className="text-sm font-bold text-brand">{priceLabel}</p>
        </div>
        {checkoutHref && !ctaDisabled ? (
          <Button className="shrink-0 bg-brand hover:bg-brand-hover" size="lg" asChild>
            <Link href={checkoutHref}>
              <Ticket className="size-4" aria-hidden />
              {ctaLabel}
            </Link>
          </Button>
        ) : (
          <Button className="shrink-0" size="lg" disabled={ctaDisabled} asChild={!ctaDisabled}>
            {ctaDisabled ? (
              <span>{ctaLabel}</span>
            ) : (
              <a href="#tickets">{ctaLabel}</a>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

interface PublicEventDetailHeroProps {
  event: Event;
}

export function PublicEventDetailHero({ event }: PublicEventDetailHeroProps) {
  const venueLabel = [event.venue?.name, event.venue?.city].filter(Boolean).join(", ");

  return (
    <section className="relative isolate overflow-hidden bg-muted">
      <div className="relative aspect-[4/3] sm:aspect-[21/9]">
        {event.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.banner_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/20 via-brand/10 to-background">
            <Calendar className="size-20 text-brand/30" aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:pb-10 sm:pt-24">
          <div className="flex flex-wrap items-center gap-2">
            {event.is_free ? <Badge variant="success">Gratis</Badge> : null}
            {event.category ? <Badge variant="secondary">{event.category.name}</Badge> : null}
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/85 sm:flex-row sm:flex-wrap sm:gap-6">
            <p className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" aria-hidden />
              {formatEventDateShort(event.start_at, event.timezone)}
            </p>
            {venueLabel ? (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {venueLabel}
              </p>
            ) : null}
            {event.organizer ? (
              <p className="flex items-center gap-2">
                <Building2 className="size-4 shrink-0" aria-hidden />
                {event.organizer.name}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <PublicEventFavoriteButton
          eventTitle={event.title}
          className="bg-black/30 text-white hover:bg-black/50"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              void navigator.share({ title: event.title, url: window.location.href });
            }
          }}
          aria-label="Bagikan event"
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </section>
  );
}

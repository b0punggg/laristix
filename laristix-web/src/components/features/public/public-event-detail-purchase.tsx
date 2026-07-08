"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tag,
  Ticket,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicEventDetailShare } from "@/components/features/public/public-event-detail-share";
import { routes } from "@/config/env";
import type { useEventPurchaseSelection } from "@/hooks/use-event-purchase-selection";
import { formatCurrency } from "@/lib/currency";
import { formatEventDateRange } from "@/lib/datetime";
import { formatVenueAddress } from "@/lib/event-page-content";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";
import type { TicketType } from "@/types/ticket";

type PurchaseSelection = ReturnType<typeof useEventPurchaseSelection>;

export function getEventDisplayPrice(event: Event, tickets: TicketType[]): string {
  const purchasable = tickets.filter((ticket) => ticket.is_purchasable);

  if (purchasable.length > 0) {
    const cheapest = purchasable.reduce((min, ticket) =>
      ticket.price < min.price ? ticket : min,
    );
    return cheapest.is_free ? "Gratis" : formatCurrency(cheapest.price, cheapest.currency);
  }

  if (event.is_free) return "Gratis";
  if (event.min_ticket_price && event.min_ticket_price > 0) {
    return formatCurrency(event.min_ticket_price);
  }

  return "—";
}

interface PublicEventDetailHeroProps {
  event: Event;
}

export function PublicEventDetailHero({ event }: PublicEventDetailHeroProps) {
  const venueLabel = formatVenueAddress(event.venue) || event.venue?.name || "Lokasi akan diumumkan";
  const dateLabel = formatEventDateRange(event.start_at, event.end_at, event.timezone);
  const categoryLabel = event.category?.name ?? "Event";

  return (
    <section className="relative isolate bg-zinc-900">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {event.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.banner_url}
            alt=""
            className="h-full w-full scale-105 object-cover opacity-50 blur-md"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
      </div>

      <div className="relative mx-auto max-w-container px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8 lg:pb-14">
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={routes.home}>
              <ChevronLeft className="size-4" />
              Kembali
            </Link>
          </Button>
        </div>

        <div className="max-w-3xl space-y-5 text-white">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            {event.title}
          </h1>
          <ul className="space-y-3 text-sm text-white/90 sm:text-base">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-light" aria-hidden />
              <span>{venueLabel}</span>
            </li>
            <li className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-5 shrink-0 text-brand-light" aria-hidden />
              <span>{dateLabel}</span>
            </li>
            <li className="flex items-start gap-3">
              <Tag className="mt-0.5 size-5 shrink-0 text-brand-light" aria-hidden />
              <span>{categoryLabel}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

interface PublicEventDetailSidebarSummaryProps {
  event: Event;
  tickets: TicketType[];
  onViewTickets: () => void;
  className?: string;
}

export function PublicEventDetailSidebarSummary({
  event,
  tickets,
  onViewTickets,
  className,
}: PublicEventDetailSidebarSummaryProps) {
  const priceLabel = getEventDisplayPrice(event, tickets);
  const ticketCount = tickets.filter((ticket) => ticket.is_purchasable).length;
  const organizer = event.organizer;
  const organizerInitials = organizer?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("space-y-5", className)}>
      <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-border/60">
        {event.banner_url ? (
          <div className="relative aspect-[4/5] max-h-72 w-full overflow-hidden bg-muted sm:max-h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-sm text-muted-foreground">Harga mulai dari</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{priceLabel}</p>
            {ticketCount > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {ticketCount} kategori tiket tersedia
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            className="w-full bg-brand text-base hover:bg-brand-hover"
            size="lg"
            onClick={onViewTickets}
          >
            <Ticket className="size-4" aria-hidden />
            Lihat Tiket
          </Button>
          {organizer ? (
            <Link
              href={routes.publicCreator(organizer.slug)}
              className="flex items-center gap-3 border-t border-border/70 pt-4 transition-colors hover:text-brand"
            >
              <Avatar className="size-10 border">
                {organizer.logo_url ? (
                  <AvatarImage src={organizer.logo_url} alt={organizer.name} />
                ) : null}
                <AvatarFallback className="bg-brand-muted text-brand">
                  {organizerInitials ?? <Building2 className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Diselenggarakan oleh</p>
                <p className="truncate font-semibold text-foreground">{organizer.name}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <PublicEventDetailShare title={event.title} className="hidden lg:block" />
    </div>
  );
}

export type PublicEventDetailTab = "deskripsi" | "tiket" | "syarat";

interface PublicEventDetailTabsProps {
  activeTab: PublicEventDetailTab;
  onTabChange: (tab: PublicEventDetailTab) => void;
}

const tabs: Array<{ id: PublicEventDetailTab; label: string }> = [
  { id: "deskripsi", label: "Deskripsi" },
  { id: "tiket", label: "Tiket" },
  { id: "syarat", label: "Syarat dan Ketentuan" },
];

export function PublicEventDetailTabs({ activeTab, onTabChange }: PublicEventDetailTabsProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-container gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? "true" : undefined}
            className={cn(
              "relative shrink-0 px-4 py-4 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "text-brand"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

interface PublicEventDetailMobilePurchaseBarProps {
  event: Event;
  tickets: TicketType[];
  purchase: PurchaseSelection;
  onViewTickets: () => void;
}

export function PublicEventDetailMobilePurchaseBar({
  event,
  tickets,
  purchase,
  onViewTickets,
}: PublicEventDetailMobilePurchaseBarProps) {
  const priceLabel = purchase.subtotalLabel ?? getEventDisplayPrice(event, tickets);
  const hasTickets = tickets.some((ticket) => ticket.is_purchasable);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
          <p className="text-sm font-bold text-brand">{priceLabel}</p>
        </div>
        {hasTickets ? (
          <Button className="shrink-0 bg-brand hover:bg-brand-hover" size="lg" onClick={onViewTickets}>
            <Ticket className="size-4" aria-hidden />
            Lihat Tiket
          </Button>
        ) : (
          <Button className="shrink-0" size="lg" disabled>
            Tiket habis
          </Button>
        )}
      </div>
    </div>
  );
}

// Legacy export kept for compatibility
export const PublicEventDetailPurchaseCard = PublicEventDetailSidebarSummary;

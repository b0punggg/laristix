"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  HelpCircle,
  ImageIcon,
  MapPin,
  Mic2,
  ScrollText,
  Ticket,
  User,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { TicketKindBadge } from "@/components/features/tickets/ticket-kind-badge";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import { formatCurrency } from "@/lib/currency";
import { formatEventDateRange, formatSalesPeriod } from "@/lib/datetime";
import {
  formatVenueAddress,
  getVenueMapEmbedUrl,
  getVenueMapLink,
  isOnlineVenue,
  type EventFaqItem,
  type EventGalleryItem,
  type EventScheduleItem,
  type EventSpeakerItem,
} from "@/lib/event-page-content";
import Link from "next/link";
import type { Event } from "@/types/event";
import type { TicketType } from "@/types/ticket";
import { cn } from "@/lib/utils";

function SectionHeading({
  id,
  icon: Icon,
  title,
  description,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-muted text-brand">
          <Icon className="size-4" aria-hidden />
        </span>
        <Text variant="h2" id={id}>
          {title}
        </Text>
      </div>
      {description ? <Text variant="caption">{description}</Text> : null}
    </div>
  );
}

export function PublicEventDetailGallery({ items }: { items: EventGalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length <= 1) {
    return null;
  }

  const active = items[activeIndex] ?? items[0];

  return (
    <section className="space-y-4" aria-labelledby="event-gallery-heading">
      <SectionHeading id="event-gallery-heading" icon={ImageIcon} title="Galeri Event" />
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="relative aspect-[16/10] bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.alt ?? "Galeri event"}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        </div>
        {items.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto p-3 scrollbar-thin">
            {items.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "ds-focus-ring relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  index === activeIndex
                    ? "border-brand shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
                aria-label={`Lihat gambar ${index + 1}`}
                aria-pressed={index === activeIndex}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PublicEventDetailOrganizerCard({ event }: { event: Event }) {
  if (!event.organizer) {
    return null;
  }

  const initials = event.organizer.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar className="size-14 border">
          {event.organizer.logo_url ? (
            <AvatarImage src={event.organizer.logo_url} alt={event.organizer.name} />
          ) : null}
          <AvatarFallback className="bg-brand-muted text-brand">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Text variant="overline">Diselenggarakan oleh</Text>
          <p className="truncate text-lg font-semibold text-foreground">{event.organizer.name}</p>
          <p className="text-sm text-muted-foreground">Penyelenggara terverifikasi Laristix</p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </CardContent>
    </Card>
  );
}

export function PublicEventDetailInfoCards({ event }: { event: Event }) {
  const venueAddress = formatVenueAddress(event.venue);
  const online = isOnlineVenue(event.venue);
  const onlineUrl = (event.venue as { online_url?: string | null } | null)?.online_url;

  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label="Informasi event">
      <Card>
        <CardContent className="flex items-start gap-4 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Calendar className="size-5" aria-hidden />
          </span>
          <div>
            <Text variant="overline">Tanggal & Waktu</Text>
            <p className="mt-1 font-semibold text-foreground">
              {formatEventDateRange(event.start_at, event.end_at, event.timezone)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Waktu setempat ({event.timezone})</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-4 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <MapPin className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <Text variant="overline">Lokasi</Text>
            <p className="mt-1 font-semibold text-foreground">
              {event.venue?.name ?? (online ? "Event Online" : "Lokasi akan diumumkan")}
            </p>
            {venueAddress ? (
              <p className="mt-1 text-sm text-muted-foreground">{venueAddress}</p>
            ) : null}
            {online && onlineUrl ? (
              <a
                href={onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                Buka link event
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function PublicEventDetailMap({ event }: { event: Event }) {
  const embedUrl = getVenueMapEmbedUrl(event.venue);
  const mapLink = getVenueMapLink(event.venue);

  if (!embedUrl || isOnlineVenue(event.venue)) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="event-map-heading">
      <SectionHeading
        id="event-map-heading"
        icon={MapPin}
        title="Peta Lokasi"
        description="Lihat lokasi venue di peta"
      />
      <div className="overflow-hidden rounded-2xl border bg-card">
        <iframe
          title={`Peta lokasi ${event.venue?.name ?? "event"}`}
          src={embedUrl}
          className="aspect-[16/9] w-full border-0 sm:aspect-[21/9]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {mapLink ? (
          <div className="border-t px-4 py-3">
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              Buka di Google Maps
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PublicEventDetailDescription({ event }: { event: Event }) {
  if (!event.short_description && !event.description) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="event-description-heading">
      <SectionHeading
        id="event-description-heading"
        icon={ScrollText}
        title="Tentang Event"
        description="Detail lengkap acara"
      />
      <div className="rounded-2xl border bg-card p-6">
        {event.short_description ? (
          <p className="text-lg font-medium leading-relaxed text-foreground">
            {event.short_description}
          </p>
        ) : null}
        {event.description ? (
          <div
            className={cn(
              "prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground",
              event.short_description && "mt-4 border-t border-border/70 pt-4",
            )}
          >
            {event.description}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PublicEventDetailSchedule({ items }: { items: EventScheduleItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="event-schedule-heading">
      <SectionHeading
        id="event-schedule-heading"
        icon={Clock}
        title="Jadwal"
        description="Rangkaian acara"
      />
      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={`${item.title}-${index}`}>
            <CardContent className="flex gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-sm font-bold text-brand">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{item.title}</p>
                {item.start_at ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.start_at}</p>
                ) : null}
                {item.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PublicEventDetailSpeakers({ items }: { items: EventSpeakerItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="event-speakers-heading">
      <SectionHeading
        id="event-speakers-heading"
        icon={Mic2}
        title="Pembicara"
        description="Narasumber dan host acara"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((speaker, index) => {
          const initials = speaker.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <Card key={`${speaker.name}-${index}`}>
              <CardContent className="flex items-start gap-4 p-5">
                <Avatar className="size-14">
                  {speaker.photo_url ? (
                    <AvatarImage src={speaker.photo_url} alt={speaker.name} />
                  ) : null}
                  <AvatarFallback className="bg-muted">
                    {initials || <User className="size-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{speaker.name}</p>
                  {speaker.title ? (
                    <p className="text-sm font-medium text-brand">{speaker.title}</p>
                  ) : null}
                  {speaker.bio ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {speaker.bio}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function PublicEventDetailFaq({ items }: { items: EventFaqItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="event-faq-heading">
      <SectionHeading
        id="event-faq-heading"
        icon={HelpCircle}
        title="FAQ"
        description="Pertanyaan yang sering diajukan"
      />
      <Accordion type="single" collapsible className="rounded-2xl border bg-card px-4">
        {items.map((item, index) => (
          <AccordionItem key={`${item.question}-${index}`} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function PublicEventDetailTerms({ terms }: { terms: string | null }) {
  if (!terms) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="event-terms-heading">
      <SectionHeading
        id="event-terms-heading"
        icon={ScrollText}
        title="Syarat & Ketentuan"
      />
      <div className="rounded-2xl border bg-card p-6">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
          {terms}
        </div>
      </div>
    </section>
  );
}

function ticketAvailabilityLabel(
  isPurchasable: boolean,
  isSoldOut: boolean,
  isSalesOpen: boolean,
) {
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

interface PublicEventDetailTicketsProps {
  eventUuid: string;
  tickets: TicketType[];
  currentUser: { id: number } | null | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function PublicEventDetailTickets({
  eventUuid,
  tickets,
  currentUser,
  isLoading,
  isError,
}: PublicEventDetailTicketsProps) {
  return (
    <section id="tickets" className="scroll-mt-28 space-y-6">
      <SectionHeading
        id="event-tickets-heading"
        icon={Ticket}
        title="Tiket"
        description="Pilih tiket yang sesuai untuk Anda"
      />

      {isLoading ? <p className="text-muted-foreground">Memuat tiket...</p> : null}

      {isError ? <p className="text-sm text-destructive">Gagal memuat daftar tiket.</p> : null}

      {!isLoading && !isError && tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">Belum ada tiket yang dipublikasikan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tiket dengan visibility publik akan ditampilkan di sini.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && tickets.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {tickets.map((ticket) => {
            const availability = ticketAvailabilityLabel(
              ticket.is_purchasable,
              ticket.is_sold_out,
              ticket.is_sales_open,
            );
            const canSelect = ticket.is_purchasable;
            const checkoutUrl = routes.publicEventCheckout(eventUuid, ticket.id);
            const ticketActionHref = currentUser
              ? checkoutUrl
              : routes.loginWithRedirect(checkoutUrl);

            return (
              <Card
                key={ticket.id}
                className={cn(
                  "overflow-hidden transition-shadow hover:shadow-md",
                  canSelect && "border-brand/20",
                )}
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">{ticket.name}</p>
                        <TicketKindBadge kind={ticket.kind} />
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-foreground">
                        {ticket.is_free ? "Gratis" : formatCurrency(ticket.price, ticket.currency)}
                      </p>
                    </div>
                    <Badge variant={canSelect ? "success" : "secondary"}>{availability}</Badge>
                  </div>

                  {ticket.description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {ticket.description}
                    </p>
                  ) : null}

                  <dl className="grid gap-2 rounded-xl bg-muted/40 p-4 text-sm">
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

                  {canSelect ? (
                    <Button className="w-full bg-brand hover:bg-brand-hover" asChild>
                      <Link href={ticketActionHref}>
                        {currentUser ? "Pilih tiket" : "Masuk untuk beli tiket"}
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      {availability}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export function PublicEventDetailStatusBar({ event }: { event: Event }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <EventStatusBadge status={event.status} />
      {event.is_free ? <Badge variant="success">Gratis</Badge> : null}
      {event.category ? <Badge variant="secondary">{event.category.name}</Badge> : null}
    </div>
  );
}

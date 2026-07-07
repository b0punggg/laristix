"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/design-system/primitives/layout";
import {
  PublicEventDetailHero,
  PublicEventDetailMobilePurchaseBar,
  PublicEventDetailPurchaseCard,
} from "@/components/features/public/public-event-detail-purchase";
import { PublicEventDetailRelated } from "@/components/features/public/public-event-detail-related";
import {
  PublicEventDetailDescription,
  PublicEventDetailFaq,
  PublicEventDetailGallery,
  PublicEventDetailInfoCards,
  PublicEventDetailMap,
  PublicEventDetailOrganizerCard,
  PublicEventDetailSchedule,
  PublicEventDetailSpeakers,
  PublicEventDetailStatusBar,
  PublicEventDetailTerms,
  PublicEventDetailTickets,
} from "@/components/features/public/public-event-detail-sections";
import { PublicEventDetailSkeleton } from "@/components/features/public/public-event-detail-skeleton";
import { routes } from "@/config/env";
import { usePublicEventQuery, usePublicTicketsQuery } from "@/hooks/use-public-events";
import { useMeQuery } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildEventGallery,
  parseEventPageContent,
} from "@/lib/event-page-content";
import type { TicketType } from "@/types/ticket";

interface PublicEventDetailProps {
  uuid: string;
}

function resolvePurchaseCta(
  tickets: TicketType[],
  currentUser: { id: number } | null | undefined,
  eventUuid: string,
) {
  const purchasable = tickets.find((ticket) => ticket.is_purchasable);

  if (!purchasable) {
    if (tickets.length === 0) {
      return {
        checkoutHref: null,
        ctaLabel: "Tiket belum tersedia",
        ctaDisabled: true,
      };
    }

    const allSoldOut = tickets.every((ticket) => ticket.is_sold_out);
    return {
      checkoutHref: null,
      ctaLabel: allSoldOut ? "Tiket habis" : "Lihat tiket",
      ctaDisabled: allSoldOut,
    };
  }

  const checkoutUrl = routes.publicEventCheckout(eventUuid, purchasable.id);

  return {
    checkoutHref: currentUser ? checkoutUrl : routes.loginWithRedirect(checkoutUrl),
    ctaLabel: currentUser ? "Beli Tiket" : "Masuk untuk beli",
    ctaDisabled: false,
  };
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

  const pageContent = useMemo(
    () => (event ? parseEventPageContent(event) : null),
    [event],
  );

  const galleryItems = useMemo(
    () => (event && pageContent ? buildEventGallery(event, pageContent) : []),
    [event, pageContent],
  );

  const purchaseCta = useMemo(
    () => resolvePurchaseCta(tickets, currentUser, uuid),
    [tickets, currentUser, uuid],
  );

  if (eventQuery.isLoading) {
    return <PublicEventDetailSkeleton />;
  }

  if (eventQuery.isError || !event || !pageContent) {
    return (
      <Container className="py-8">
        <div className="space-y-4">
          <Button variant="ghost" asChild className="-ml-2">
            <Link href={routes.home}>
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-lg font-semibold text-foreground">Event tidak ditemukan</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Event mungkin belum dipublikasikan atau tidak tersedia untuk publik.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="relative pb-24 lg:pb-12">
      <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
        <Button
          variant="ghost"
          asChild
          className="bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:text-white"
        >
          <Link href={routes.home}>
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Semua event</span>
          </Link>
        </Button>
      </div>

      <PublicEventDetailHero event={event} />

      <Container className="py-8 md:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
          <main className="space-y-12 md:space-y-14">
            <div className="space-y-6 lg:hidden">
              <PublicEventDetailStatusBar event={event} />
              {event.short_description ? (
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {event.short_description}
                </p>
              ) : null}
            </div>

            <PublicEventDetailOrganizerCard event={event} />
            <PublicEventDetailGallery items={galleryItems} />
            <PublicEventDetailInfoCards event={event} />
            <PublicEventDetailMap event={event} />
            <PublicEventDetailDescription event={event} />
            <PublicEventDetailSchedule items={pageContent.schedule} />
            <PublicEventDetailSpeakers items={pageContent.speakers} />
            <PublicEventDetailFaq items={pageContent.faq} />
            <PublicEventDetailTerms terms={pageContent.terms} />
            <PublicEventDetailTickets
              eventUuid={uuid}
              tickets={tickets}
              currentUser={currentUser}
              isLoading={ticketsQuery.isLoading}
              isError={ticketsQuery.isError}
            />
            <PublicEventDetailRelated event={event} />
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <PublicEventDetailPurchaseCard
                event={event}
                tickets={tickets}
                currentUser={currentUser}
                checkoutHref={purchaseCta.checkoutHref}
                ctaLabel={purchaseCta.ctaLabel}
                ctaDisabled={purchaseCta.ctaDisabled}
              />
            </div>
          </aside>
        </div>
      </Container>

      <PublicEventDetailMobilePurchaseBar
        event={event}
        tickets={tickets}
        checkoutHref={purchaseCta.checkoutHref}
        ctaLabel={purchaseCta.ctaLabel}
        ctaDisabled={purchaseCta.ctaDisabled}
      />
    </div>
  );
}

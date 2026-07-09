"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/design-system/primitives/layout";
import {
  PublicEventDetailHero,
  PublicEventDetailMobilePurchaseBar,
  PublicEventDetailSidebarSummary,
  PublicEventDetailTabs,
  type PublicEventDetailTab,
} from "@/components/features/public/public-event-detail-purchase";
import { PublicEventDetailRelated } from "@/components/features/public/public-event-detail-related";
import { PublicEventDetailShare } from "@/components/features/public/public-event-detail-share";
import {
  PublicEventDetailDescription,
  PublicEventDetailFaq,
  PublicEventDetailGallery,
  PublicEventDetailInfoCards,
  PublicEventDetailLoketTickets,
  PublicEventDetailMap,
  PublicEventDetailOrganizerCard,
  PublicEventDetailSchedule,
  PublicEventDetailSpeakers,
  PublicEventDetailTerms,
} from "@/components/features/public/public-event-detail-sections";
import { PublicEventDetailSkeleton } from "@/components/features/public/public-event-detail-skeleton";
import { routes } from "@/config/env";
import { useEventPurchaseSelection } from "@/hooks/use-event-purchase-selection";
import { usePublicEventQuery, usePublicTicketsQuery } from "@/hooks/use-public-events";
import { useMeQuery } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { buildEventGallery, parseEventPageContent } from "@/lib/event-page-content";

const TAB_SECTIONS: Record<PublicEventDetailTab, string> = {
  deskripsi: "deskripsi",
  tiket: "tickets",
  syarat: "syarat",
};

const SECTION_TO_TAB = Object.fromEntries(
  Object.entries(TAB_SECTIONS).map(([tab, sectionId]) => [sectionId, tab]),
) as Record<string, PublicEventDetailTab>;

const SCROLL_SPY_OFFSET = 88;

interface PublicEventDetailProps {
  uuid: string;
}

export function PublicEventDetail({ uuid }: PublicEventDetailProps) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const storedUser = useAuthStore((s) => s.user);
  const { data: me } = useMeQuery(isHydrated);
  const currentUser = me ?? storedUser;
  const [activeTab, setActiveTab] = useState<PublicEventDetailTab>("deskripsi");

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

  const purchase = useEventPurchaseSelection(tickets, uuid, currentUser);

  const scrollToSection = useCallback((tab: PublicEventDetailTab) => {
    setActiveTab(tab);
    document.getElementById(TAB_SECTIONS[tab])?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const goToTicketsTab = useCallback(() => {
    scrollToSection("tiket");
  }, [scrollToSection]);

  useEffect(() => {
    const sectionIds = Object.values(TAB_SECTIONS);
    let ticking = false;

    const updateActiveSection = () => {
      let currentSection = sectionIds[0];

      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);
        if (element && element.getBoundingClientRect().top <= SCROLL_SPY_OFFSET) {
          currentSection = sectionId;
        }
      }

      const nextTab = SECTION_TO_TAB[currentSection];
      if (nextTab) {
        setActiveTab((current) => (current === nextTab ? current : nextTab));
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActiveSection);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateActiveSection();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <PublicEventDetailHero event={event} />
      <PublicEventDetailTabs activeTab={activeTab} onTabChange={scrollToSection} />

      <Container className="py-8 md:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <div className="mb-8 lg:hidden">
              <PublicEventDetailSidebarSummary
                event={event}
                tickets={tickets}
                onViewTickets={goToTicketsTab}
              />
              <PublicEventDetailShare title={event.title} className="mt-5" />
            </div>

            <div className="space-y-12">
              <section id="deskripsi" className="scroll-mt-28 space-y-12">
                <PublicEventDetailInfoCards event={event} />
                <PublicEventDetailOrganizerCard event={event} />
                <PublicEventDetailDescription event={event} />
                <PublicEventDetailGallery items={galleryItems} />
                <PublicEventDetailSchedule items={pageContent.schedule} />
                <PublicEventDetailSpeakers items={pageContent.speakers} />
                <PublicEventDetailMap event={event} />
                <PublicEventDetailFaq items={pageContent.faq} />
              </section>

              <PublicEventDetailLoketTickets
                eventUuid={uuid}
                tickets={tickets}
                currentUser={currentUser}
                isLoading={ticketsQuery.isLoading}
                isError={ticketsQuery.isError}
              />

              <section id="syarat" className="scroll-mt-28">
                <PublicEventDetailTerms terms={pageContent.terms} />
              </section>
            </div>

            <div className="mt-12">
              <PublicEventDetailRelated event={event} />
            </div>
          </div>

          <aside className="relative z-30 hidden lg:block">
            <div className="sticky top-6 -mt-[21.5rem]">
              <PublicEventDetailSidebarSummary
                event={event}
                tickets={tickets}
                onViewTickets={goToTicketsTab}
              />
            </div>
          </aside>
        </div>
      </Container>

      <PublicEventDetailMobilePurchaseBar
        event={event}
        tickets={tickets}
        purchase={purchase}
        onViewTickets={goToTicketsTab}
      />
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/design-system/primitives/layout";
import { PublicEventList } from "@/components/features/public/public-event-list";
import { StorefrontHero } from "@/components/layouts/storefront/storefront-hero";
import { PublicHomeContinueSection } from "@/components/features/public/public-home-continue-section";
import { PublicHomeDiscovery } from "@/components/features/public/public-home-discovery";
import { PublicHomeFaqSection } from "@/components/features/public/public-home-faq";
import { PublicHomeHowItWorksSection } from "@/components/features/public/public-home-how-it-works";
import { PublicHomeLocalEventsSection } from "@/components/features/public/public-home-local-events-section";
import { PublicHomeOrganizerCtaSection } from "@/components/features/public/public-home-organizer-cta";
import { PublicHomeOrganizersSection } from "@/components/features/public/public-home-organizers-section";
import { PublicHomeSections } from "@/components/features/public/public-home-sections";
import { PublicHomeStatsSection } from "@/components/features/public/public-home-stats-section";
import { PublicHomeTestimonialsSection } from "@/components/features/public/public-home-testimonials";
import { PublicHomeWhySection } from "@/components/features/public/public-home-why-section";
import {
  hasActiveDiscoveryFilters,
  parsePublicDiscoveryFilters,
} from "@/lib/public-discovery-filters";

export function PublicHomeContent() {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parsePublicDiscoveryFilters(searchParams),
    [searchParams],
  );
  const hasFilters = hasActiveDiscoveryFilters(filters);

  return (
    <>
      {hasFilters ? (
        <Container className="py-8 md:py-10">
          <PublicEventList title="Temukan Event" variant="page" />
        </Container>
      ) : (
        <>
          <StorefrontHero />

          <Container>
            <PublicHomeContinueSection />
          </Container>

          <PublicHomeSections />
          <PublicHomeDiscovery />

          <Container>
            <PublicHomeLocalEventsSection hidden={Boolean(filters.city)} />
          </Container>

          <PublicHomeStatsSection />
          <PublicHomeOrganizersSection />
          <PublicHomeWhySection />
          <PublicHomeHowItWorksSection />
          <PublicHomeTestimonialsSection />
          <PublicHomeFaqSection />

          <Container className="py-12 md:py-16">
            <PublicEventList title="Jelajahi Semua Event" variant="section" />
          </Container>

          <PublicHomeOrganizerCtaSection />
        </>
      )}
    </>
  );
}

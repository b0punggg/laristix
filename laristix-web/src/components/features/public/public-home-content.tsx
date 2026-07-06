"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicEventList } from "@/components/features/public/public-event-list";
import { PublicHomeContinueSection } from "@/components/features/public/public-home-continue-section";
import { PublicHomeDiscovery } from "@/components/features/public/public-home-discovery";
import { PublicHomeLocalEventsSection } from "@/components/features/public/public-home-local-events-section";
import { PublicHomeSections } from "@/components/features/public/public-home-sections";
import { PublicStickyDiscoveryBar } from "@/components/features/public/public-sticky-discovery-bar";
import { PublicTrustSection } from "@/components/features/public/public-trust-section";
import { StorefrontHero } from "@/components/layouts/storefront/storefront-hero";
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickyVisible(!entry.isIntersecting);
      },
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {!hasFilters ? <StorefrontHero /> : null}
      <PublicHomeDiscovery />
      <div ref={sentinelRef} className="h-px" aria-hidden />
      <PublicStickyDiscoveryBar visible={stickyVisible} />
      {hasFilters ? (
        <PublicEventList />
      ) : (
        <>
          <PublicHomeContinueSection />
          <PublicHomeSections />
          <PublicHomeLocalEventsSection hidden={Boolean(filters.city)} />
          <PublicTrustSection />
          <PublicEventList title="Semua event" />
        </>
      )}
    </>
  );
}

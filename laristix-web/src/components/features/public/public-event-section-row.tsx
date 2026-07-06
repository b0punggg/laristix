"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PublicEventCard } from "@/components/features/public/public-event-card";
import { PublicEventCardSkeleton } from "@/components/features/public/public-event-card-skeleton";
import { usePublicEventsPageQuery } from "@/hooks/use-public-events";
import type { PublicEventListFilters } from "@/types/event";

interface PublicEventSectionRowProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  filters: PublicEventListFilters;
}

export function PublicEventSectionRow({
  title,
  subtitle,
  viewAllHref,
  filters,
}: PublicEventSectionRowProps) {
  const { data, isLoading, isError } = usePublicEventsPageQuery(filters);
  const events = data?.data ?? [];

  if (!isLoading && !isError && events.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="storefront-section-title">{title}</h2>
          {subtitle ? <p className="storefront-section-subtitle">{subtitle}</p> : null}
        </div>
        <Link
          href={viewAllHref}
          className="storefront-focus-ring inline-flex shrink-0 items-center gap-0.5 rounded-sm text-sm font-medium text-brand hover:underline"
        >
          Lihat semua
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      {isLoading ? (
        <div className="-mx-1 flex gap-4 overflow-hidden px-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[260px] shrink-0">
              <PublicEventCardSkeleton />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && events.length > 0 ? (
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-thin md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
          {events.map((event, index) => (
            <div key={event.uuid} className="w-[260px] shrink-0 md:w-auto">
              <PublicEventCard event={event} compact animationIndex={index} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

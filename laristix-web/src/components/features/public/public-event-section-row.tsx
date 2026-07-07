"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PublicEventCard } from "@/components/features/public/public-event-card";
import { PublicEventCardSkeleton } from "@/components/features/public/public-event-card-skeleton";
import { Text } from "@/design-system/primitives/text";
import { Container } from "@/design-system/primitives/layout";
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
    <section className="space-y-6">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Text variant="h2">{title}</Text>
            {subtitle ? (
              <Text variant="caption" className="mt-1">
                {subtitle}
              </Text>
            ) : null}
          </div>
          <Link
            href={viewAllHref}
            className="ds-focus-ring inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            Lihat semua
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Container>

      {isLoading ? (
        <div className="-mx-1 flex gap-4 overflow-hidden px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[280px] shrink-0">
              <PublicEventCardSkeleton />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && events.length > 0 ? (
        <div className="-mx-1 flex gap-5 overflow-x-auto px-4 pb-2 scrollbar-thin md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
          {events.map((event, index) => (
            <div key={event.uuid} className="w-[280px] shrink-0 md:w-auto">
              <PublicEventCard event={event} compact animationIndex={index} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

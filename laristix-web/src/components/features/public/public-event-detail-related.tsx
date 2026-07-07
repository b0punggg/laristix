"use client";

import { PublicEventCard } from "@/components/features/public/public-event-card";
import { PublicEventCardSkeleton } from "@/components/features/public/public-event-card-skeleton";
import { Text } from "@/design-system/primitives/text";
import { usePublicEventsPageQuery } from "@/hooks/use-public-events";
import type { Event } from "@/types/event";

interface PublicEventDetailRelatedProps {
  event: Event;
}

export function PublicEventDetailRelated({ event }: PublicEventDetailRelatedProps) {
  const { data, isLoading, isError } = usePublicEventsPageQuery({
    category_id: event.category?.id,
    per_page: 4,
    sort: "start_at",
    upcoming_days: 60,
  });

  const relatedEvents = (data?.data ?? []).filter((item) => item.uuid !== event.uuid).slice(0, 4);

  if (!isLoading && !isError && relatedEvents.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="related-events-heading">
      <div>
        <Text variant="h2" id="related-events-heading">
          Event Terkait
        </Text>
        <Text variant="caption" className="mt-1">
          Event serupa yang mungkin Anda sukai
        </Text>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <PublicEventCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-muted-foreground">Gagal memuat event terkait.</p>
      ) : null}

      {!isLoading && !isError && relatedEvents.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {relatedEvents.map((item, index) => (
            <PublicEventCard key={item.uuid} event={item} animationIndex={index} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

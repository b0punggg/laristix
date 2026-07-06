"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { usePublicEventsQuery } from "@/hooks/use-public-events";
import {
  discoveryFiltersToEventList,
  getSectionFilterLabel,
  hasActiveDiscoveryFilters,
  parsePublicDiscoveryFilters,
} from "@/lib/public-discovery-filters";
import { PublicActiveFiltersBar } from "./public-active-filters-bar";
import { PublicDiscoveryErrorState, PublicEmptyEventsState } from "./public-discovery-states";
import { PublicEventCard } from "./public-event-card";
import { PublicEventGridSkeleton } from "./public-event-card-skeleton";

interface PublicEventListProps {
  title?: string;
  showHeading?: boolean;
}

export function PublicEventList({ title = "Event", showHeading = true }: PublicEventListProps) {
  const searchParams = useSearchParams();
  const { clearFilters } = usePublicDiscoveryNavigation();
  const discovery = useMemo(
    () => parsePublicDiscoveryFilters(searchParams),
    [searchParams],
  );

  const filters = useMemo(
    () => discoveryFiltersToEventList(discovery, { per_page: 12 }),
    [discovery],
  );

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePublicEventsQuery(filters);

  const events = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const total = data?.pages[0]?.meta.total ?? 0;
  const sectionLabel = getSectionFilterLabel(discovery);
  const hasFilters = hasActiveDiscoveryFilters(discovery);

  return (
    <div className="storefront-section mx-auto max-w-7xl space-y-5 px-4">
      {showHeading ? <h2 className="storefront-section-title">{title}</h2> : null}

      <PublicActiveFiltersBar />

      {discovery.q && !isLoading ? (
        <p className="text-sm text-muted-foreground">
          Hasil pencarian untuk &ldquo;{discovery.q}&rdquo;
        </p>
      ) : null}

      {sectionLabel && !isLoading ? (
        <p className="text-sm text-muted-foreground">Menampilkan: {sectionLabel}</p>
      ) : null}

      {isLoading ? <PublicEventGridSkeleton /> : null}

      {isError ? <PublicDiscoveryErrorState onRetry={() => refetch()} /> : null}

      {!isLoading && !isError && events.length === 0 ? (
        <PublicEmptyEventsState hasFilters={hasFilters} onClearFilters={clearFilters} />
      ) : null}

      {!isLoading && !isError && events.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            Menampilkan {events.length} dari {total} event
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, index) => (
              <PublicEventCard key={event.uuid} event={event} animationIndex={index % 8} />
            ))}
          </div>
          {hasNextPage ? (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  "Muat lebih banyak"
                )}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

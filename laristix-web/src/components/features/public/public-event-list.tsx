"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PublicActiveFiltersBar } from "@/components/features/public/public-active-filters-bar";
import { PublicDiscoveryErrorState, PublicEmptyEventsState } from "@/components/features/public/public-discovery-states";
import { PublicEventCard } from "@/components/features/public/public-event-card";
import { PublicEventGridSkeleton } from "@/components/features/public/public-event-card-skeleton";
import { PublicEventListingFilters } from "@/components/features/public/public-event-listing-filters";
import { PublicEventListPagination } from "@/components/features/public/public-event-list-pagination";
import { PublicEventListingToolbar } from "@/components/features/public/public-event-listing-toolbar";
import { Text } from "@/design-system/primitives/text";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { usePublicEventsQuery } from "@/hooks/use-public-events";
import {
  discoveryFiltersToEventList,
  getSectionFilterLabel,
  hasActiveDiscoveryFilters,
  parsePublicDiscoveryFilters,
} from "@/lib/public-discovery-filters";
import { cn } from "@/lib/utils";

interface PublicEventListProps {
  title?: string;
  showHeading?: boolean;
  variant?: "page" | "section";
}

export function PublicEventList({
  title = "Event",
  showHeading = true,
  variant = "section",
}: PublicEventListProps) {
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
  const meta = data?.pages[data.pages.length - 1]?.meta ?? data?.pages[0]?.meta;
  const total = meta?.total ?? 0;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const sectionLabel = getSectionFilterLabel(discovery);
  const hasFilters = hasActiveDiscoveryFilters(discovery);
  const isPageVariant = variant === "page";

  const grid = (
    <div
      className={cn(
        "grid gap-5",
        "grid-cols-1",
        "md:grid-cols-2",
        "xl:grid-cols-4",
      )}
    >
      {events.map((event, index) => (
        <PublicEventCard key={event.uuid} event={event} animationIndex={index % 12} />
      ))}
    </div>
  );

  const resultsContent = (
    <>
      {isLoading ? <PublicEventGridSkeleton count={isPageVariant ? 12 : 8} /> : null}

      {isError ? <PublicDiscoveryErrorState onRetry={() => refetch()} /> : null}

      {!isLoading && !isError && events.length === 0 ? (
        <PublicEmptyEventsState hasFilters={hasFilters} onClearFilters={clearFilters} />
      ) : null}

      {!isLoading && !isError && events.length > 0 ? (
        <>
          {grid}
          <PublicEventListPagination
            loadedCount={events.length}
            total={total}
            currentPage={currentPage}
            lastPage={lastPage}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        </>
      ) : null}
    </>
  );

  if (isPageVariant) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <header className="space-y-2">
          {showHeading ? (
            <Text variant="h1" className="text-2xl md:text-3xl">
              {title}
            </Text>
          ) : null}
          {discovery.q && !isLoading ? (
            <Text variant="body-md" className="text-muted-foreground">
              Hasil pencarian untuk &ldquo;{discovery.q}&rdquo;
            </Text>
          ) : null}
          {sectionLabel && !isLoading ? (
            <Text variant="body-md" className="text-muted-foreground">
              Menampilkan: {sectionLabel}
            </Text>
          ) : null}
        </header>

        <PublicEventListingToolbar
          total={total}
          loadedCount={events.length}
          isLoading={isLoading}
          sticky
        />

        <PublicActiveFiltersBar />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="sticky top-36 space-y-1 rounded-2xl border bg-card p-5 shadow-sm">
              <Text variant="h4" className="mb-4">
                Filter
              </Text>
              <PublicEventListingFilters showSort />
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-6">{resultsContent}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeading ? <Text variant="h2">{title}</Text> : null}

      <PublicActiveFiltersBar />

      {discovery.q && !isLoading ? (
        <Text variant="caption">
          Hasil pencarian untuk &ldquo;{discovery.q}&rdquo;
        </Text>
      ) : null}

      {sectionLabel && !isLoading ? (
        <Text variant="caption">Menampilkan: {sectionLabel}</Text>
      ) : null}

      {resultsContent}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicEventsQuery } from "@/hooks/use-public-events";
import type { PublicEventListFilters } from "@/types/event";
import { PublicEventCard } from "./public-event-card";

interface PublicEventListProps {
  showHeading?: boolean;
  hideSearch?: boolean;
}

export function PublicEventList({ showHeading = true, hideSearch = false }: PublicEventListProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get("q")?.trim() ?? "";

  const filters = useMemo<PublicEventListFilters>(
    () => ({
      search: search || undefined,
      per_page: 12,
    }),
    [search],
  );

  const { data, isLoading, isError, refetch } = usePublicEventsQuery(filters);
  const events = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-10">
      {showHeading ? (
        <h2 className="text-2xl font-bold text-gray-900">Event</h2>
      ) : null}

      {!hideSearch && search ? (
        <p className="text-sm text-muted-foreground">
          Hasil pencarian untuk &ldquo;{search}&rdquo;
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-muted-foreground">Memuat event...</p>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">Gagal memuat event.</p>
          <button
            type="button"
            className="mt-2 text-primary underline-offset-4 hover:underline"
            onClick={() => refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">
            {search ? "Tidak ada event yang cocok dengan pencarian Anda." : "Belum ada event yang dipublikasikan"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Coba kata kunci lain atau hapus filter pencarian."
              : "Event dengan status published akan muncul di sini."}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && events.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {total} event ditemukan
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <PublicEventCard key={event.uuid} event={event} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/services/event/event-api";
import type { PublicEventListFilters } from "@/types/event";

export const publicCreatorKeys = {
  all: ["public-creators"] as const,
  detail: (slug: string) => ["public-creators", slug] as const,
  events: (slug: string, timeframe: "active" | "past", page = 1) =>
    ["public-creators", slug, "events", timeframe, page] as const,
};

export function usePublicCreatorQuery(slug: string, enabled = true) {
  return useQuery({
    queryKey: publicCreatorKeys.detail(slug),
    queryFn: () => eventApi.showPublicCreator(slug),
    enabled: enabled && slug.length > 0,
  });
}

export function usePublicCreatorEventsQuery(
  slug: string,
  timeframe: "active" | "past",
  page = 1,
  enabled = true,
) {
  const filters: PublicEventListFilters = {
    organizer_slug: slug,
    timeframe,
    page,
    per_page: 12,
    sort: timeframe === "past" ? undefined : "start_at",
  };

  return useQuery({
    queryKey: publicCreatorKeys.events(slug, timeframe, page),
    queryFn: () => eventApi.listPublic(filters),
    enabled: enabled && slug.length > 0,
  });
}

"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { eventApi } from "@/services/event/event-api";
import { publicTicketApi } from "@/services/ticket/ticket-api";
import type { PublicEventListFilters } from "@/types/event";

export const publicEventKeys = {
  all: ["public-events"] as const,
  list: (filters: PublicEventListFilters) => ["public-events", "list", filters] as const,
  detail: (uuid: string) => ["public-events", uuid] as const,
  tickets: (uuid: string) => ["public-events", uuid, "tickets"] as const,
};

export function usePublicEventsQuery(filters: PublicEventListFilters = {}) {
  return useInfiniteQuery({
    queryKey: publicEventKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => eventApi.listPublic({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
}

export function usePublicEventsPageQuery(filters: PublicEventListFilters = {}) {
  return useQuery({
    queryKey: publicEventKeys.list({ ...filters, page: filters.page ?? 1 }),
    queryFn: () => eventApi.listPublic({ ...filters, page: filters.page ?? 1 }),
  });
}

export function usePublicEventQuery(uuid: string, enabled = true) {
  return useQuery({
    queryKey: publicEventKeys.detail(uuid),
    queryFn: () => eventApi.showPublic(uuid),
    enabled: enabled && uuid.length > 0,
  });
}

export function usePublicTicketsQuery(eventUuid: string, enabled = true) {
  return useQuery({
    queryKey: publicEventKeys.tickets(eventUuid),
    queryFn: () => publicTicketApi.list(eventUuid),
    enabled: enabled && eventUuid.length > 0,
  });
}

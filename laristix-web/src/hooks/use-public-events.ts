"use client";

import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: publicEventKeys.list(filters),
    queryFn: () => eventApi.listPublic(filters),
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

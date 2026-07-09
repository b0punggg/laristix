"use client";

import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/services/event/event-api";
import { useOrganizerStore } from "@/stores/organizer-store";
import type { EventAttendeesFilters } from "@/types/organizer";

export const eventAttendeeKeys = {
  list: (organizerId: number | null, eventUuid: string, filters: EventAttendeesFilters) =>
    ["organizer", organizerId, "event", eventUuid, "attendees", filters] as const,
  order: (organizerId: number | null, eventUuid: string, orderUuid: string) =>
    ["organizer", organizerId, "event", eventUuid, "order", orderUuid] as const,
};

export function useEventAttendeesQuery(
  eventUuid: string,
  filters: EventAttendeesFilters = {},
  enabled = true,
) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: eventAttendeeKeys.list(organizerId, eventUuid, filters),
    queryFn: () => eventApi.attendees(eventUuid, filters),
    staleTime: 15_000,
    refetchInterval: 30_000,
    enabled: enabled && eventUuid.length > 0 && organizerId !== null,
  });
}

export async function fetchAllEventAttendees(
  eventUuid: string,
  filters: Omit<EventAttendeesFilters, "page" | "per_page"> = {},
) {
  const perPage = 100;
  let page = 1;
  let lastPage = 1;
  const rows = [];

  while (page <= lastPage) {
    const response = await eventApi.attendees(eventUuid, {
      ...filters,
      page,
      per_page: perPage,
    });

    rows.push(...response.data);
    lastPage = response.meta.last_page;
    page += 1;
  }

  return rows;
}

export function useEventOrderQuery(eventUuid: string, orderUuid: string | null, enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: eventAttendeeKeys.order(organizerId, eventUuid, orderUuid ?? ""),
    queryFn: () => eventApi.eventOrder(eventUuid, orderUuid!),
    enabled: enabled && eventUuid.length > 0 && Boolean(orderUuid) && organizerId !== null,
  });
}

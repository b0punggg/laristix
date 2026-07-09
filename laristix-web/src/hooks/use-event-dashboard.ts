"use client";

import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/services/event/event-api";
import { useOrganizerStore } from "@/stores/organizer-store";

export const eventDashboardKeys = {
  summary: (organizerId: number | null, eventUuid: string) =>
    ["organizer", organizerId, "event", eventUuid, "dashboard", "summary"] as const,
  trends: (organizerId: number | null, eventUuid: string, days: number) =>
    ["organizer", organizerId, "event", eventUuid, "dashboard", "trends", days] as const,
  insights: (organizerId: number | null, eventUuid: string) =>
    ["organizer", organizerId, "event", eventUuid, "dashboard", "insights"] as const,
};

export function useEventDashboardSummaryQuery(eventUuid: string, enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: eventDashboardKeys.summary(organizerId, eventUuid),
    queryFn: () => eventApi.dashboardSummary(eventUuid),
    staleTime: 60_000,
    enabled: enabled && eventUuid.length > 0 && organizerId !== null,
  });
}

export function useEventDashboardTrendsQuery(eventUuid: string, days = 14, enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: eventDashboardKeys.trends(organizerId, eventUuid, days),
    queryFn: () => eventApi.dashboardTrends(eventUuid, days),
    staleTime: 60_000,
    enabled: enabled && eventUuid.length > 0 && organizerId !== null,
  });
}

export function useEventDashboardInsightsQuery(eventUuid: string, enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: eventDashboardKeys.insights(organizerId, eventUuid),
    queryFn: () => eventApi.dashboardInsights(eventUuid),
    staleTime: 60_000,
    enabled: enabled && eventUuid.length > 0 && organizerId !== null,
  });
}

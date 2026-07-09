"use client";

import { useQuery } from "@tanstack/react-query";
import { organizerApi } from "@/services/organizer/organizer-api";
import { useOrganizerStore } from "@/stores/organizer-store";

export const organizerDashboardKeys = {
  summary: (organizerId: number | null) =>
    ["organizer", organizerId, "dashboard", "summary"] as const,
  trends: (organizerId: number | null, days: number) =>
    ["organizer", organizerId, "dashboard", "trends", days] as const,
  insights: (organizerId: number | null) =>
    ["organizer", organizerId, "dashboard", "insights"] as const,
  scannerSummary: (organizerId: number | null) =>
    ["organizer", organizerId, "dashboard", "scanner-summary"] as const,
};

export function useOrganizerDashboardSummaryQuery(enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: organizerDashboardKeys.summary(organizerId),
    queryFn: () => organizerApi.dashboardSummary(),
    staleTime: 60_000,
    enabled: enabled && organizerId !== null,
  });
}

export function useOrganizerDashboardTrendsQuery(days = 14, enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: organizerDashboardKeys.trends(organizerId, days),
    queryFn: () => organizerApi.dashboardTrends(days),
    staleTime: 60_000,
    enabled: enabled && organizerId !== null,
  });
}

export function useOrganizerDashboardInsightsQuery(enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: organizerDashboardKeys.insights(organizerId),
    queryFn: () => organizerApi.dashboardInsights(),
    staleTime: 60_000,
    enabled: enabled && organizerId !== null,
  });
}

export function useOrganizerScannerDashboardQuery(enabled = true) {
  const organizerId = useOrganizerStore((s) => s.activeOrganizerId);

  return useQuery({
    queryKey: organizerDashboardKeys.scannerSummary(organizerId),
    queryFn: () => organizerApi.dashboardScannerSummary(),
    enabled: enabled && organizerId !== null,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

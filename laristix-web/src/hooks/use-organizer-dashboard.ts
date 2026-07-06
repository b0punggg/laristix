"use client";

import { useQuery } from "@tanstack/react-query";
import { organizerApi } from "@/services/organizer/organizer-api";

export const organizerDashboardKeys = {
  summary: ["organizer", "dashboard", "summary"] as const,
  trends: (days: number) => ["organizer", "dashboard", "trends", days] as const,
  insights: ["organizer", "dashboard", "insights"] as const,
};

export function useOrganizerDashboardSummaryQuery() {
  return useQuery({
    queryKey: organizerDashboardKeys.summary,
    queryFn: () => organizerApi.dashboardSummary(),
    staleTime: 60_000,
  });
}

export function useOrganizerDashboardTrendsQuery(days = 14) {
  return useQuery({
    queryKey: organizerDashboardKeys.trends(days),
    queryFn: () => organizerApi.dashboardTrends(days),
    staleTime: 60_000,
  });
}

export function useOrganizerDashboardInsightsQuery() {
  return useQuery({
    queryKey: organizerDashboardKeys.insights,
    queryFn: () => organizerApi.dashboardInsights(),
    staleTime: 60_000,
  });
}

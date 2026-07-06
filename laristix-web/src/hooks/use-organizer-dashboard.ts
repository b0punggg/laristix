"use client";

import { useQuery } from "@tanstack/react-query";
import { organizerApi } from "@/services/organizer/organizer-api";

export const organizerDashboardKeys = {
  summary: ["organizer", "dashboard", "summary"] as const,
  trends: (days: number) => ["organizer", "dashboard", "trends", days] as const,
  insights: ["organizer", "dashboard", "insights"] as const,
  scannerSummary: ["organizer", "dashboard", "scanner-summary"] as const,
};

export function useOrganizerDashboardSummaryQuery(enabled = true) {
  return useQuery({
    queryKey: organizerDashboardKeys.summary,
    queryFn: () => organizerApi.dashboardSummary(),
    staleTime: 60_000,
    enabled,
  });
}

export function useOrganizerDashboardTrendsQuery(days = 14, enabled = true) {
  return useQuery({
    queryKey: organizerDashboardKeys.trends(days),
    queryFn: () => organizerApi.dashboardTrends(days),
    staleTime: 60_000,
    enabled,
  });
}

export function useOrganizerDashboardInsightsQuery(enabled = true) {
  return useQuery({
    queryKey: organizerDashboardKeys.insights,
    queryFn: () => organizerApi.dashboardInsights(),
    staleTime: 60_000,
    enabled,
  });
}

export function useOrganizerScannerDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: organizerDashboardKeys.scannerSummary,
    queryFn: () => organizerApi.dashboardScannerSummary(),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

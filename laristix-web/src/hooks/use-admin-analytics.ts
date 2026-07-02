"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/admin/admin-api";
import type { LogListFilters } from "@/types/admin";
import { formatIdr, formatNumber } from "@/lib/format";

export { formatIdr, formatNumber };

export const adminAnalyticsKeys = {
  summary: ["admin", "dashboard", "summary"] as const,
  trends: (days: number) => ["admin", "analytics", "trends", days] as const,
  activityLogs: (filters: LogListFilters) => ["admin", "activity-logs", filters] as const,
  auditLogs: (filters: LogListFilters) => ["admin", "audit-logs", filters] as const,
};

export function useAdminDashboardSummaryQuery() {
  return useQuery({
    queryKey: adminAnalyticsKeys.summary,
    queryFn: () => adminApi.dashboardSummary(),
    staleTime: 60_000,
  });
}

export function useAdminAnalyticsTrendsQuery(days = 30) {
  return useQuery({
    queryKey: adminAnalyticsKeys.trends(days),
    queryFn: () => adminApi.analyticsTrends(days),
    staleTime: 60_000,
  });
}

export function useActivityLogsQuery(filters: LogListFilters = {}, enabled = true) {
  return useQuery({
    queryKey: adminAnalyticsKeys.activityLogs(filters),
    queryFn: () => adminApi.listActivityLogs(filters),
    enabled,
    staleTime: 30_000,
  });
}

export function useAuditLogsQuery(filters: LogListFilters = {}, enabled = true) {
  return useQuery({
    queryKey: adminAnalyticsKeys.auditLogs(filters),
    queryFn: () => adminApi.listAuditLogs(filters),
    enabled,
    staleTime: 30_000,
  });
}

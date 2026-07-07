"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  ScanLine,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/common/refresh-button";
import { OrganizerMetricCard } from "@/components/features/organizer/organizer-metric-card";
import {
  OrganizerCheckInHighlight,
  OrganizerDashboardCharts,
  OrganizerEventCalendar,
  OrganizerNotificationsPanel,
  OrganizerQuickActions,
  OrganizerRecentActivities,
  OrganizerRecentOrders,
  OrganizerRevenueHero,
  OrganizerUpcomingEvents,
} from "@/components/features/organizer/organizer-dashboard-sections";
import { OrganizerEmptyOnboarding } from "@/components/features/organizer/organizer-empty-onboarding";
import { OrganizerInvitationsList } from "@/components/features/organizer/organizer-invitations-list";
import { OrganizerPageHeader } from "@/components/features/organizer/organizer-page-header";
import { ScannerDashboardPanel } from "@/components/features/organizer/scanner-dashboard-panel";
import {
  useOrganizerDashboardInsightsQuery,
  useOrganizerDashboardSummaryQuery,
  useOrganizerDashboardTrendsQuery,
} from "@/hooks/use-organizer-dashboard";
import { routes } from "@/config/env";
import { formatIdr } from "@/lib/format";
import { canManageMembers, isScannerRole } from "@/lib/permissions";
import { exportOrganizerSummaryCsv } from "@/lib/organizer-analytics-export";
import { toOrganizerChartSeries } from "@/lib/organizer-chart";
import { useAuthStore } from "@/stores/auth-store";

export function OrganizerDashboardPanel() {
  const user = useAuthStore((s) => s.user);
  const isScanner = isScannerRole(user);
  const summaryQuery = useOrganizerDashboardSummaryQuery(!isScanner);
  const trendsQuery = useOrganizerDashboardTrendsQuery(14, !isScanner);
  const insightsQuery = useOrganizerDashboardInsightsQuery(!isScanner);

  const trendSeries = useMemo(
    () => toOrganizerChartSeries(trendsQuery.data?.series ?? []),
    [trendsQuery.data?.series],
  );

  if (isScanner) {
    return <ScannerDashboardPanel />;
  }

  const totals = summaryQuery.data?.totals;
  const today = summaryQuery.data?.today;
  const hasNoEvents = !summaryQuery.isLoading && totals?.events === 0;

  const refreshAll = () => {
    void summaryQuery.refetch();
    void trendsQuery.refetch();
    void insightsQuery.refetch();
  };

  const isRefreshing =
    summaryQuery.isFetching || trendsQuery.isFetching || insightsQuery.isFetching;

  const lastUpdated = Math.max(
    summaryQuery.dataUpdatedAt,
    trendsQuery.dataUpdatedAt,
    insightsQuery.dataUpdatedAt,
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 18) return "Selamat siang";
    return "Selamat malam";
  }, []);

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title={`${greeting}, ${user?.name?.split(" ")[0] ?? "Organizer"}`}
        description="Ringkasan performa event, penjualan tiket, dan aktivitas check-in."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {summaryQuery.data ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportOrganizerSummaryCsv(summaryQuery.data!)}
              >
                <Download className="size-4" aria-hidden />
                Export
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={routes.organizerAnalytics}>
                <BarChart3 className="size-4" aria-hidden />
                Analitik
              </Link>
            </Button>
            {canManageMembers(user) ? (
              <Button asChild variant="outline" size="sm">
                <Link href={routes.organizerTeam}>Tim</Link>
              </Button>
            ) : null}
            <RefreshButton
              onRefresh={refreshAll}
              isFetching={isRefreshing}
              updatedAt={lastUpdated}
            />
          </div>
        }
      />

      <OrganizerQuickActions />

      <OrganizerInvitationsList />

      {hasNoEvents ? <OrganizerEmptyOnboarding /> : null}

      <OrganizerRevenueHero summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OrganizerMetricCard
          label="Order hari ini"
          value={today?.orders ?? 0}
          hint={`${totals?.orders_completed ?? 0} order selesai total`}
          icon={ShoppingCart}
          accent="violet"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <OrganizerMetricCard
          label="Tiket terjual"
          value={totals?.tickets_sold ?? 0}
          hint={`${totals?.registrations ?? 0} registrasi`}
          icon={Ticket}
          accent="brand"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <OrganizerMetricCard
          label="Pendapatan hari ini"
          value={today ? formatIdr(today.revenue_net) : formatIdr(0)}
          hint={`Gross: ${today ? formatIdr(today.revenue_gross) : formatIdr(0)}`}
          icon={DollarSign}
          accent="emerald"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <OrganizerMetricCard
          label="Check-in total"
          value={totals?.check_ins ?? 0}
          hint={`Hari ini: ${today?.check_ins ?? 0}`}
          icon={ScanLine}
          accent="sky"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OrganizerMetricCard
          label="Event"
          value={totals?.events ?? 0}
          hint={`${totals?.events_published ?? 0} dipublikasi · ${totals?.events_draft ?? 0} draft`}
          icon={Calendar}
          accent="amber"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <OrganizerMetricCard
          label="Registrasi"
          value={totals?.registrations ?? 0}
          hint={`Hari ini: ${today?.registrations ?? 0}`}
          icon={Users}
          accent="rose"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
      </div>

      {!hasNoEvents ? (
        <>
          <OrganizerCheckInHighlight count={insightsQuery.data?.check_in_today.count ?? 0} />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <OrganizerDashboardCharts
                trendSeries={trendSeries}
                isLoading={trendsQuery.isLoading}
                isError={trendsQuery.isError}
                onRetry={() => trendsQuery.refetch()}
              />
            </div>
            <div className="space-y-6">
              <OrganizerEventCalendar
                events={insightsQuery.data?.upcoming_events ?? []}
                isLoading={insightsQuery.isLoading}
              />
              <OrganizerNotificationsPanel
                insights={insightsQuery.data}
                isLoading={insightsQuery.isLoading}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <OrganizerUpcomingEvents
              insights={insightsQuery.data}
              isLoading={insightsQuery.isLoading}
            />
            <OrganizerRecentOrders
              insights={insightsQuery.data}
              isLoading={insightsQuery.isLoading}
            />
          </div>

          <OrganizerRecentActivities
            insights={insightsQuery.data}
            isLoading={insightsQuery.isLoading}
          />
        </>
      ) : null}
    </div>
  );
}

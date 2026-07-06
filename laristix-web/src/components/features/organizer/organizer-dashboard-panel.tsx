"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  ScanLine,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { RefreshButton } from "@/components/common/refresh-button";
import { AdminMetricCard } from "@/components/features/admin/admin-metric-card";
import { ChartSkeleton, SimpleBarChart } from "@/components/features/admin/simple-bar-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizerDashboardInsightsSection } from "@/components/features/organizer/organizer-dashboard-insights";
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

  if (isScanner) {
    return <ScannerDashboardPanel />;
  }

  const totals = summaryQuery.data?.totals;
  const today = summaryQuery.data?.today;
  const trendSeries = useMemo(
    () => toOrganizerChartSeries(trendsQuery.data?.series ?? []),
    [trendsQuery.data?.series],
  );

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

  return (
    <div className="space-y-6">
      <OrganizerPageHeader
        title="Dashboard"
        description="Ringkasan event, registrasi, pendapatan, dan aktivitas check-in."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {summaryQuery.data ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportOrganizerSummaryCsv(summaryQuery.data!)}
              >
                <Download className="mr-2 size-4" />
                Export ringkasan
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={routes.organizerAnalytics}>
                <BarChart3 className="mr-2 size-4" />
                Analitik lengkap
              </Link>
            </Button>
            {canManageMembers(user) ? (
              <Button asChild variant="outline" size="sm">
                <Link href={routes.organizerTeam}>Kelola tim</Link>
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

      <OrganizerInvitationsList />

      {hasNoEvents ? <OrganizerEmptyOnboarding /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title="Pendapatan"
          value={totals ? formatIdr(totals.revenue_net) : 0}
          subtitle={`Hari ini: ${today ? formatIdr(today.revenue_net) : formatIdr(0)}`}
          icon={DollarSign}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <AdminMetricCard
          title="Registrasi"
          value={totals?.registrations ?? 0}
          subtitle={`Hari ini: ${today?.registrations ?? 0}`}
          icon={Users}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <AdminMetricCard
          title="Tiket terjual"
          value={totals?.tickets_sold ?? 0}
          subtitle={`${totals?.orders_completed ?? 0} order selesai`}
          icon={Ticket}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <AdminMetricCard
          title="Check-in"
          value={totals?.check_ins ?? 0}
          subtitle={`Hari ini: ${today?.check_ins ?? 0}`}
          icon={ScanLine}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
      </div>

      {!hasNoEvents ? (
        <OrganizerDashboardInsightsSection
          insights={insightsQuery.data}
          isLoading={insightsQuery.isLoading}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Event</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryQuery.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{totals?.events ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {totals?.events_published ?? 0} dipublikasi · {totals?.events_draft ?? 0} draft
            </p>
            <Button asChild size="sm">
              <Link href={routes.organizerEvents}>Lihat event</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Penjualan gross
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryQuery.isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold">
                {totals ? formatIdr(totals.revenue_gross) : formatIdr(0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Biaya platform: {totals ? formatIdr(totals.platform_fees) : formatIdr(0)}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.scanner}>Buka scanner</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Tren 14 hari</CardTitle>
            <p className="text-sm text-muted-foreground">Order, pendapatan, dan check-in</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.organizerAnalytics}>Lihat semua</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {trendsQuery.isLoading ? (
            <div className="space-y-8">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : trendsQuery.isError ? (
            <EmptyState
              icon={TrendingUp}
              title="Gagal memuat tren"
              description="Periksa koneksi lalu coba lagi."
            >
              <Button variant="outline" size="sm" onClick={() => trendsQuery.refetch()}>
                Coba lagi
              </Button>
            </EmptyState>
          ) : (
            <>
              <SimpleBarChart data={trendSeries} valueKey="orders" label="Order harian" />
              <SimpleBarChart
                data={trendSeries}
                valueKey="revenue_gross"
                label="Pendapatan harian (net)"
                formatValue={formatIdr}
              />
              <SimpleBarChart data={trendSeries} valueKey="check_ins" label="Check-in harian" />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

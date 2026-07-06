"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, DollarSign, Download, ScanLine, Ticket, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { RefreshButton } from "@/components/common/refresh-button";
import { AdminMetricCard, AdminMetricCardSkeleton } from "@/components/features/admin/admin-metric-card";
import { ChartSkeleton, SimpleBarChart } from "@/components/features/admin/simple-bar-chart";
import { OrganizerPageHeader } from "@/components/features/organizer/organizer-page-header";
import { routes } from "@/config/env";
import {
  useOrganizerDashboardInsightsQuery,
  useOrganizerDashboardSummaryQuery,
  useOrganizerDashboardTrendsQuery,
} from "@/hooks/use-organizer-dashboard";
import { formatIdr, formatNumber } from "@/lib/format";
import {
  exportOrganizerTopEventsCsv,
  exportOrganizerTrendsCsv,
} from "@/lib/organizer-analytics-export";
import { toOrganizerChartSeries } from "@/lib/organizer-chart";

export function OrganizerAnalyticsPanel() {
  const [days, setDays] = useState(30);
  const summaryQuery = useOrganizerDashboardSummaryQuery();
  const trendsQuery = useOrganizerDashboardTrendsQuery(days);
  const insightsQuery = useOrganizerDashboardInsightsQuery();

  const totals = summaryQuery.data?.totals;
  const series = useMemo(
    () => toOrganizerChartSeries(trendsQuery.data?.series ?? []),
    [trendsQuery.data?.series],
  );

  const periodTotals = useMemo(() => {
    return (trendsQuery.data?.series ?? []).reduce(
      (acc, point) => ({
        orders: acc.orders + point.orders,
        revenue_net: acc.revenue_net + point.revenue_net,
        revenue_gross: acc.revenue_gross + point.revenue_gross,
        platform_fees: acc.platform_fees + point.platform_fees,
        check_ins: acc.check_ins + point.check_ins,
      }),
      { orders: 0, revenue_net: 0, revenue_gross: 0, platform_fees: 0, check_ins: 0 },
    );
  }, [trendsQuery.data?.series]);

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

  const topEvents = insightsQuery.data?.top_events_by_revenue ?? [];

  return (
    <div className="space-y-6">
      <OrganizerPageHeader
        title="Analitik"
        description="Performa penjualan tiket, pendapatan, dan kehadiran event Anda."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={routes.organizerDashboard}>Kembali ke dashboard</Link>
            </Button>
            <RefreshButton
              onRefresh={refreshAll}
              isFetching={isRefreshing}
              updatedAt={lastUpdated}
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="organizer-trend-days">
            Periode
          </label>
          <Select
            id="organizer-trend-days"
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-32"
          >
            <option value="7">7 hari</option>
            <option value="14">14 hari</option>
            <option value="30">30 hari</option>
            <option value="60">60 hari</option>
            <option value="90">90 hari</option>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={series.length === 0}
          onClick={() => exportOrganizerTrendsCsv(trendsQuery.data?.series ?? [], days)}
        >
          <Download className="mr-2 size-4" />
          Export tren (CSV)
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={topEvents.length === 0}
          onClick={() => exportOrganizerTopEventsCsv(topEvents)}
        >
          <Download className="mr-2 size-4" />
          Export event terlaris (CSV)
        </Button>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Total keseluruhan</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryQuery.isLoading ? (
            <>
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
            </>
          ) : (
            <>
              <AdminMetricCard
                title="Pendapatan net"
                value={totals ? formatIdr(totals.revenue_net) : "—"}
                icon={DollarSign}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Registrasi"
                value={totals ? formatNumber(totals.registrations) : "—"}
                icon={Users}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Tiket terjual"
                value={totals ? formatNumber(totals.tickets_sold) : "—"}
                icon={Ticket}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Check-in"
                value={totals ? formatNumber(totals.check_ins) : "—"}
                icon={ScanLine}
                isError={summaryQuery.isError}
              />
            </>
          )}
        </div>
      </div>

      {!trendsQuery.isLoading && !trendsQuery.isError && series.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Order ({days}h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatNumber(periodTotals.orders)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendapatan net ({days}h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatIdr(periodTotals.revenue_net)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Biaya platform ({days}h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatIdr(periodTotals.platform_fees)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Check-in ({days}h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatNumber(periodTotals.check_ins)}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {trendsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <ChartSkeleton />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : trendsQuery.isError ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={BarChart3}
              title="Gagal memuat analitik"
              description="Periksa koneksi lalu coba lagi."
            >
              <Button variant="outline" onClick={() => trendsQuery.refetch()}>
                Coba lagi
              </Button>
            </EmptyState>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order harian</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={series} valueKey="orders" label="Order" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pendapatan net harian</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={series}
                valueKey="revenue_gross"
                label="Pendapatan net"
                formatValue={formatIdr}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Check-in harian</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={series} valueKey="check_ins" label="Check-in" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biaya platform harian</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={series}
                valueKey="platform_fees"
                label="Biaya platform"
                formatValue={formatIdr}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

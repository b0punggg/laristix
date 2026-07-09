"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, DollarSign, Download, ExternalLink, ScanLine, Ticket, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { RefreshButton } from "@/components/common/refresh-button";
import { AdminMetricCard, AdminMetricCardSkeleton } from "@/components/features/admin/admin-metric-card";
import { ChartSkeleton, SimpleBarChart } from "@/components/features/admin/simple-bar-chart";
import { EventDashboardInsightsPanel } from "@/components/features/events/event-dashboard-insights";
import { OrganizerPageHeader } from "@/components/features/organizer/organizer-page-header";
import { routes } from "@/config/env";
import {
  useEventDashboardInsightsQuery,
  useEventDashboardSummaryQuery,
  useEventDashboardTrendsQuery,
} from "@/hooks/use-event-dashboard";
import { useEventsQuery } from "@/hooks/use-events";
import {
  useOrganizerDashboardInsightsQuery,
  useOrganizerDashboardSummaryQuery,
  useOrganizerDashboardTrendsQuery,
} from "@/hooks/use-organizer-dashboard";
import {
  exportEventRecentOrdersCsv,
  exportEventSummaryCsv,
  exportEventTicketBreakdownCsv,
  exportEventTrendsCsv,
} from "@/lib/event-analytics-export";
import { formatIdr, formatNumber } from "@/lib/format";
import {
  exportOrganizerTopEventsCsv,
  exportOrganizerTrendsCsv,
} from "@/lib/organizer-analytics-export";
import { toOrganizerChartSeries } from "@/lib/organizer-chart";

export function OrganizerAnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [selectedEventUuid, setSelectedEventUuid] = useState("");

  const eventsQuery = useEventsQuery({ per_page: 100 });
  const events = eventsQuery.data?.data ?? [];
  const isEventScoped = selectedEventUuid.length > 0;
  const selectedEvent = events.find((event) => event.uuid === selectedEventUuid);

  const organizerSummaryQuery = useOrganizerDashboardSummaryQuery(!isEventScoped);
  const organizerTrendsQuery = useOrganizerDashboardTrendsQuery(days, !isEventScoped);
  const organizerInsightsQuery = useOrganizerDashboardInsightsQuery(!isEventScoped);

  const eventSummaryQuery = useEventDashboardSummaryQuery(selectedEventUuid, isEventScoped);
  const eventTrendsQuery = useEventDashboardTrendsQuery(selectedEventUuid, days, isEventScoped);
  const eventInsightsQuery = useEventDashboardInsightsQuery(selectedEventUuid, isEventScoped);

  const summaryQuery = isEventScoped ? eventSummaryQuery : organizerSummaryQuery;
  const trendsQuery = isEventScoped ? eventTrendsQuery : organizerTrendsQuery;
  const insightsQuery = isEventScoped ? eventInsightsQuery : organizerInsightsQuery;

  const organizerTotals = organizerSummaryQuery.data?.totals;
  const eventTotals = eventSummaryQuery.data?.totals;

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
    if (isEventScoped) {
      void eventSummaryQuery.refetch();
      void eventTrendsQuery.refetch();
      void eventInsightsQuery.refetch();
      return;
    }

    void organizerSummaryQuery.refetch();
    void organizerTrendsQuery.refetch();
    void organizerInsightsQuery.refetch();
  };

  const isRefreshing =
    summaryQuery.isFetching || trendsQuery.isFetching || insightsQuery.isFetching;

  const lastUpdated = Math.max(
    summaryQuery.dataUpdatedAt,
    trendsQuery.dataUpdatedAt,
    insightsQuery.dataUpdatedAt,
  );

  const topEvents = organizerInsightsQuery.data?.top_events_by_revenue ?? [];
  const eventTitle =
    selectedEvent?.title ?? eventSummaryQuery.data?.event.title ?? "event";

  return (
    <div className="space-y-6">
      <OrganizerPageHeader
        title="Analitik"
        description={
          isEventScoped
            ? `Performa penjualan dan kehadiran untuk ${eventTitle}.`
            : "Performa penjualan tiket, pendapatan, dan kehadiran event Anda."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={routes.organizerDashboard}>Kembali ke dashboard</Link>
            </Button>
            {isEventScoped ? (
              <Button asChild variant="outline" size="sm">
                <Link href={routes.organizerEventDashboard(selectedEventUuid)}>
                  <ExternalLink className="size-4" aria-hidden />
                  Dashboard event
                </Link>
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="analytics-event-filter">
            Event
          </label>
          <Select
            id="analytics-event-filter"
            value={selectedEventUuid}
            onChange={(e) => setSelectedEventUuid(e.target.value)}
            className="min-w-[220px]"
            disabled={eventsQuery.isLoading}
          >
            <option value="">Semua event</option>
            {events.map((event) => (
              <option key={event.uuid} value={event.uuid}>
                {event.title}
              </option>
            ))}
          </Select>
        </div>
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
        {isEventScoped ? (
          <>
            {eventSummaryQuery.data ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportEventSummaryCsv(eventSummaryQuery.data!)}
              >
                <Download className="mr-2 size-4" />
                Export ringkasan
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              disabled={series.length === 0}
              onClick={() =>
                exportEventTrendsCsv(trendsQuery.data?.series ?? [], days, eventTitle)
              }
            >
              <Download className="mr-2 size-4" />
              Export tren
            </Button>
            {eventInsightsQuery.data ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={eventInsightsQuery.data.ticket_breakdown.length === 0}
                  onClick={() =>
                    exportEventTicketBreakdownCsv(eventInsightsQuery.data!, eventTitle)
                  }
                >
                  <Download className="mr-2 size-4" />
                  Export tiket
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={eventInsightsQuery.data.recent_orders.length === 0}
                  onClick={() =>
                    exportEventRecentOrdersCsv(eventInsightsQuery.data!, eventTitle)
                  }
                >
                  <Download className="mr-2 size-4" />
                  Export order
                </Button>
              </>
            ) : null}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          {isEventScoped ? "Total event ini" : "Total keseluruhan"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryQuery.isLoading ? (
            <>
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
            </>
          ) : isEventScoped ? (
            <>
              <AdminMetricCard
                title="Pendapatan net"
                value={eventTotals ? formatIdr(eventTotals.revenue_net) : "—"}
                icon={DollarSign}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Registrasi"
                value={eventTotals ? formatNumber(eventTotals.registrations) : "—"}
                icon={Users}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Tiket terjual"
                value={eventTotals ? formatNumber(eventTotals.tickets_sold) : "—"}
                icon={Ticket}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Check-in"
                value={eventTotals ? formatNumber(eventTotals.check_ins) : "—"}
                icon={ScanLine}
                isError={summaryQuery.isError}
              />
            </>
          ) : (
            <>
              <AdminMetricCard
                title="Pendapatan net"
                value={organizerTotals ? formatIdr(organizerTotals.revenue_net) : "—"}
                icon={DollarSign}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Registrasi"
                value={organizerTotals ? formatNumber(organizerTotals.registrations) : "—"}
                icon={Users}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Tiket terjual"
                value={organizerTotals ? formatNumber(organizerTotals.tickets_sold) : "—"}
                icon={Ticket}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Check-in"
                value={organizerTotals ? formatNumber(organizerTotals.check_ins) : "—"}
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

      {isEventScoped ? (
        <EventDashboardInsightsPanel
          insights={eventInsightsQuery.data}
          isLoading={eventInsightsQuery.isLoading}
          isError={eventInsightsQuery.isError}
        />
      ) : topEvents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {topEvents.map((item) => (
                <div
                  key={item.event.uuid}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatIdr(item.revenue_net)} · {item.orders_count} order
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEventUuid(item.event.uuid)}
                    >
                      Filter
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={routes.organizerEventDashboard(item.event.uuid)}>Dashboard</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

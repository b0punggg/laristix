"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  Download,
  ScanLine,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RefreshButton } from "@/components/common/refresh-button";
import { OrganizerMetricCard } from "@/components/features/organizer/organizer-metric-card";
import { OrganizerDashboardCharts } from "@/components/features/organizer/organizer-dashboard-sections";
import { EventDashboardInsightsPanel } from "@/components/features/events/event-dashboard-insights";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { EventSubNav } from "@/components/features/events/event-sub-nav";
import {
  useEventDashboardInsightsQuery,
  useEventDashboardSummaryQuery,
  useEventDashboardTrendsQuery,
} from "@/hooks/use-event-dashboard";
import { useEventQuery } from "@/hooks/use-events";
import { routes } from "@/config/env";
import { formatEventDateRange } from "@/lib/datetime";
import {
  exportEventRecentOrdersCsv,
  exportEventSummaryCsv,
  exportEventTicketBreakdownCsv,
  exportEventTrendsCsv,
} from "@/lib/event-analytics-export";
import { formatIdr } from "@/lib/format";
import { toOrganizerChartSeries } from "@/lib/organizer-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/design-system/primitives/text";
import type { EventStatus } from "@/types/event";

interface EventDashboardPanelProps {
  eventUuid: string;
}

function EventRevenueHero({
  revenueNet,
  revenueGross,
  platformFees,
  todayNet,
  todayOrders,
  ticketsSold,
  isLoading,
}: {
  revenueNet: number;
  revenueGross: number;
  platformFees: number;
  todayNet: number;
  todayOrders: number;
  ticketsSold: number;
  isLoading?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-brand/20 bg-gradient-to-br from-brand/5 via-card to-card">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Text variant="overline" className="text-brand">
            Pendapatan bersih event
          </Text>
          {isLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {formatIdr(revenueNet)}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Hari ini:{" "}
            <span className="font-semibold text-foreground">{formatIdr(todayNet)}</span>
            {" · "}
            Gross: {formatIdr(revenueGross)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-background/80 px-4 py-3">
            <p className="text-xs text-muted-foreground">Order hari ini</p>
            <p className="text-xl font-bold">{todayOrders}</p>
          </div>
          <div className="rounded-xl border bg-background/80 px-4 py-3">
            <p className="text-xs text-muted-foreground">Tiket terjual</p>
            <p className="text-xl font-bold">{ticketsSold}</p>
          </div>
          <div className="col-span-2 rounded-xl border bg-background/80 px-4 py-3 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Biaya platform</p>
            <p className="text-xl font-bold">{formatIdr(platformFees)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventDashboardPanel({ eventUuid }: EventDashboardPanelProps) {
  const [days, setDays] = useState(14);

  const eventQuery = useEventQuery(eventUuid);
  const summaryQuery = useEventDashboardSummaryQuery(eventUuid);
  const trendsQuery = useEventDashboardTrendsQuery(eventUuid, days);
  const insightsQuery = useEventDashboardInsightsQuery(eventUuid);

  const event = eventQuery.data;
  const totals = summaryQuery.data?.totals;
  const today = summaryQuery.data?.today;
  const eventTitle = event?.title ?? summaryQuery.data?.event.title ?? "event";

  const trendSeries = useMemo(
    () => toOrganizerChartSeries(trendsQuery.data?.series ?? []),
    [trendsQuery.data?.series],
  );

  const refreshAll = () => {
    void eventQuery.refetch();
    void summaryQuery.refetch();
    void trendsQuery.refetch();
    void insightsQuery.refetch();
  };

  const isRefreshing =
    eventQuery.isFetching ||
    summaryQuery.isFetching ||
    trendsQuery.isFetching ||
    insightsQuery.isFetching;

  const lastUpdated = Math.max(
    eventQuery.dataUpdatedAt,
    summaryQuery.dataUpdatedAt,
    trendsQuery.dataUpdatedAt,
    insightsQuery.dataUpdatedAt,
  );

  const eventStatus = (event?.status ?? summaryQuery.data?.event.status) as
    | EventStatus
    | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={routes.organizerEvents}>
            <ArrowLeft className="size-4" />
            Kembali ke event
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{eventTitle}</h1>
            {eventStatus ? <EventStatusBadge status={eventStatus} /> : null}
          </div>
          {event ? (
            <p className="text-sm text-muted-foreground">
              {formatEventDateRange(event.start_at, event.end_at, event.timezone)}
            </p>
          ) : null}
        </div>
        <RefreshButton
          onRefresh={refreshAll}
          isFetching={isRefreshing}
          updatedAt={lastUpdated}
        />
      </div>

      <EventSubNav eventUuid={eventUuid} eventStatus={eventStatus} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="event-trend-days">
            Periode tren
          </label>
          <Select
            id="event-trend-days"
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
        {summaryQuery.data ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportEventSummaryCsv(summaryQuery.data!)}
          >
            <Download className="size-4" aria-hidden />
            Export ringkasan
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          disabled={(trendsQuery.data?.series.length ?? 0) === 0}
          onClick={() =>
            exportEventTrendsCsv(trendsQuery.data?.series ?? [], days, eventTitle)
          }
        >
          <Download className="size-4" aria-hidden />
          Export tren
        </Button>
        {insightsQuery.data ? (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={insightsQuery.data.ticket_breakdown.length === 0}
              onClick={() => exportEventTicketBreakdownCsv(insightsQuery.data!, eventTitle)}
            >
              <Download className="size-4" aria-hidden />
              Export tiket
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={insightsQuery.data.recent_orders.length === 0}
              onClick={() => exportEventRecentOrdersCsv(insightsQuery.data!, eventTitle)}
            >
              <Download className="size-4" aria-hidden />
              Export order
            </Button>
          </>
        ) : null}
      </div>

      <EventRevenueHero
        revenueNet={totals?.revenue_net ?? 0}
        revenueGross={totals?.revenue_gross ?? 0}
        platformFees={totals?.platform_fees ?? 0}
        todayNet={today?.revenue_net ?? 0}
        todayOrders={today?.orders ?? 0}
        ticketsSold={totals?.tickets_sold ?? 0}
        isLoading={summaryQuery.isLoading}
      />

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
          hint={`${totals?.tickets_remaining ?? 0} sisa kuota`}
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
          hint={`Hari ini: ${today?.check_ins ?? insightsQuery.data?.check_in_today.count ?? 0}`}
          icon={ScanLine}
          accent="sky"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OrganizerMetricCard
          label="Registrasi"
          value={totals?.registrations ?? 0}
          hint={`Hari ini: ${today?.registrations ?? 0}`}
          icon={Users}
          accent="rose"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <OrganizerMetricCard
          label="Biaya platform"
          value={totals ? formatIdr(totals.platform_fees) : formatIdr(0)}
          hint="Total biaya layanan"
          icon={BarChart3}
          accent="amber"
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
      </div>

      <OrganizerDashboardCharts
        trendSeries={trendSeries}
        isLoading={trendsQuery.isLoading}
        isError={trendsQuery.isError}
        onRetry={() => trendsQuery.refetch()}
      />

      <EventDashboardInsightsPanel
        insights={insightsQuery.data}
        isLoading={insightsQuery.isLoading}
        isError={insightsQuery.isError}
      />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={routes.organizerEventTickets(eventUuid)}>
            <Ticket className="size-4" aria-hidden />
            Kelola tiket
          </Link>
        </Button>
        {eventStatus === "published" || eventStatus === "live" ? (
          <Button asChild variant="outline" size="sm">
            <Link href={routes.organizerEventAttendance(eventUuid)}>
              <ScanLine className="size-4" aria-hidden />
              Kehadiran
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm">
          <Link href={routes.scanner}>Buka scanner</Link>
        </Button>
      </div>
    </div>
  );
}

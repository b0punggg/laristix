"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronRight,
  Plus,
  ScanLine,
  ShoppingBag,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { ChartSkeleton, SimpleBarChart } from "@/components/features/admin/simple-bar-chart";
import { EmptyState } from "@/components/common/empty-state";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import { formatIdr } from "@/lib/format";
import { formatEventDateShort } from "@/lib/datetime";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type {
  OrganizerDashboardInsights,
  OrganizerDashboardSummary,
  OrganizerDashboardTrends,
  OrganizerEventInsight,
} from "@/types/organizer";
import type { AnalyticsTrendPoint } from "@/types/admin";
import type { EventStatus } from "@/types/event";
import { cn } from "@/lib/utils";

interface OrganizerQuickActionsProps {
  className?: string;
}

export function OrganizerQuickActions({ className }: OrganizerQuickActionsProps) {
  const user = useAuthStore((s) => s.user);
  const canCreate = canManageEvents(user);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {canCreate ? (
        <Button asChild size="sm" className="bg-brand hover:bg-brand-hover">
          <Link href={routes.organizerEventNew}>
            <Plus className="size-4" aria-hidden />
            Buat event
          </Link>
        </Button>
      ) : null}
      <Button asChild size="sm" variant="outline">
        <Link href={routes.organizerEvents}>
          <Calendar className="size-4" aria-hidden />
          Kelola event
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={routes.organizerAnalytics}>
          <BarChart3 className="size-4" aria-hidden />
          Analitik
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={routes.scanner}>
          <ScanLine className="size-4" aria-hidden />
          Scanner
        </Link>
      </Button>
    </div>
  );
}

interface OrganizerRevenueHeroProps {
  summary?: OrganizerDashboardSummary;
  isLoading?: boolean;
}

export function OrganizerRevenueHero({ summary, isLoading }: OrganizerRevenueHeroProps) {
  const totals = summary?.totals;
  const today = summary?.today;

  return (
    <Card className="overflow-hidden border-brand/20 bg-gradient-to-br from-brand/5 via-card to-card">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Text variant="overline" className="text-brand">
            Pendapatan bersih
          </Text>
          {isLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {formatIdr(totals?.revenue_net ?? 0)}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Hari ini:{" "}
            <span className="font-semibold text-foreground">
              {formatIdr(today?.revenue_net ?? 0)}
            </span>
            {" · "}
            Gross: {formatIdr(totals?.revenue_gross ?? 0)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-background/80 px-4 py-3">
            <p className="text-xs text-muted-foreground">Order hari ini</p>
            <p className="text-xl font-bold">{today?.orders ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-background/80 px-4 py-3">
            <p className="text-xs text-muted-foreground">Tiket terjual</p>
            <p className="text-xl font-bold">{totals?.tickets_sold ?? 0}</p>
          </div>
          <div className="col-span-2 rounded-xl border bg-background/80 px-4 py-3 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Check-in hari ini</p>
            <p className="text-xl font-bold">{today?.check_ins ?? 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OrganizerDashboardChartsProps {
  trendSeries: AnalyticsTrendPoint[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function OrganizerDashboardCharts({
  trendSeries,
  isLoading,
  isError,
  onRetry,
}: OrganizerDashboardChartsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">Tren 14 hari</CardTitle>
          <p className="text-sm text-muted-foreground">Order, pendapatan, dan check-in</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.organizerAnalytics}>
            Lihat semua
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-8">
            <ChartSkeleton />
          </div>
        ) : isError ? (
          <EmptyState
            icon={TrendingUp}
            title="Gagal memuat tren"
            description="Periksa koneksi lalu coba lagi."
          >
            <Button variant="outline" size="sm" onClick={onRetry}>
              Coba lagi
            </Button>
          </EmptyState>
        ) : (
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Order</TabsTrigger>
              <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
              <TabsTrigger value="checkins">Check-in</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <SimpleBarChart data={trendSeries} valueKey="orders" label="Order harian" />
            </TabsContent>
            <TabsContent value="revenue">
              <SimpleBarChart
                data={trendSeries}
                valueKey="revenue_gross"
                label="Pendapatan harian (net)"
                formatValue={formatIdr}
              />
            </TabsContent>
            <TabsContent value="checkins">
              <SimpleBarChart data={trendSeries} valueKey="check_ins" label="Check-in harian" />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function EventRow({
  event,
  trailing,
}: {
  event: OrganizerEventInsight;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-foreground">{event.title}</p>
          <EventStatusBadge status={event.status as EventStatus} />
        </div>
        <p className="text-xs text-muted-foreground">
          {formatEventDateShort(event.start_at, event.timezone)}
          {event.venue_city ? ` · ${event.venue_city}` : ""}
        </p>
      </div>
      {trailing}
    </div>
  );
}

interface OrganizerUpcomingEventsProps {
  insights?: OrganizerDashboardInsights;
  isLoading?: boolean;
}

export function OrganizerUpcomingEvents({ insights, isLoading }: OrganizerUpcomingEventsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="size-4 text-brand" aria-hidden />
          Event mendatang
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (insights?.upcoming_events.length ?? 0) === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada event aktif mendatang.
          </p>
        ) : (
          <div className="divide-y">
            {insights?.upcoming_events.map((event) => (
              <EventRow
                key={event.uuid}
                event={event}
                trailing={
                  <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link
                      href={routes.organizerEventDashboard(event.uuid)}
                    >
                      Dashboard
                    </Link>
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface OrganizerRecentOrdersProps {
  insights?: OrganizerDashboardInsights;
  isLoading?: boolean;
}

export function OrganizerRecentOrders({ insights, isLoading }: OrganizerRecentOrdersProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBag className="size-4 text-brand" aria-hidden />
          Penjualan terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (insights?.top_events_by_revenue.length ?? 0) === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada penjualan tiket.</p>
        ) : (
          <div className="divide-y">
            {insights?.top_events_by_revenue.map((item) => (
              <EventRow
                key={item.event.uuid}
                event={item.event}
                trailing={
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatIdr(item.revenue_net)}</p>
                      <p className="text-xs text-muted-foreground">{item.orders_count} order</p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={routes.organizerEventDashboard(item.event.uuid)}>Dashboard</Link>
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface OrganizerEventCalendarProps {
  events: OrganizerEventInsight[];
  isLoading?: boolean;
}

export function OrganizerEventCalendar({ events, isLoading }: OrganizerEventCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    for (const event of events) {
      set.add(new Date(event.start_at).toISOString().slice(0, 10));
    }
    return set;
  }, [events]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(viewYear, viewMonth, 1),
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Kalender event</CardTitle>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear((y) => y - 1);
              } else {
                setViewMonth((m) => m - 1);
              }
            }}
          >
            ‹
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear((y) => y + 1);
              } else {
                setViewMonth((m) => m + 1);
              }
            }}
          >
            ›
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm font-medium capitalize text-foreground">{monthLabel}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasEvent = eventDates.has(dateKey);
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();

            return (
              <div
                key={day}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-lg text-xs",
                  isToday && "bg-brand font-semibold text-brand-foreground",
                  !isToday && hasEvent && "bg-brand-muted font-medium text-brand",
                  !isToday && !hasEvent && "text-muted-foreground",
                )}
              >
                {day}
                {hasEvent && !isToday ? (
                  <span className="absolute bottom-1 size-1 rounded-full bg-brand" aria-hidden />
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface OrganizerRecentActivitiesProps {
  insights?: OrganizerDashboardInsights;
  isLoading?: boolean;
}

export function OrganizerRecentActivities({ insights, isLoading }: OrganizerRecentActivitiesProps) {
  const activities = useMemo(() => {
    if (!insights) {
      return [];
    }

    const items: Array<{ id: string; title: string; description: string; time?: string }> = [];

    if (insights.check_in_today.count > 0) {
      items.push({
        id: "check-in-today",
        title: `${insights.check_in_today.count} check-in hari ini`,
        description: "Aktivitas scan tiket terbaru di event Anda.",
      });
    }

    for (const item of insights.attention_items) {
      items.push({
        id: `attention-${item.type}-${item.event.uuid}`,
        title: item.event.title,
        description: item.message,
      });
    }

    for (const event of insights.upcoming_events.slice(0, 3)) {
      items.push({
        id: `upcoming-${event.uuid}`,
        title: event.title,
        description: `Event mendatang · ${formatEventDateShort(event.start_at, event.timezone)}`,
      });
    }

    return items.slice(0, 8);
  }, [insights]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4 text-brand" aria-hidden />
          Aktivitas terkini
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada aktivitas terbaru.
          </p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                  <Ticket className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface OrganizerNotificationsPanelProps {
  insights?: OrganizerDashboardInsights;
  isLoading?: boolean;
}

export function OrganizerNotificationsPanel({
  insights,
  isLoading,
}: OrganizerNotificationsPanelProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-amber-600" aria-hidden />
          Perlu perhatian
          {(insights?.attention_items.length ?? 0) > 0 ? (
            <Badge variant="warning">{insights?.attention_items.length}</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (insights?.attention_items.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">Semua event dalam kondisi baik.</p>
        ) : (
          <ul className="space-y-3">
            {insights?.attention_items.map((item) => (
              <li key={`${item.type}-${item.event.uuid}`} className="rounded-xl border p-3">
                <p className="text-sm font-medium text-foreground">{item.event.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link
                    href={
                      canManageEvents(user)
                        ? routes.organizerEventDashboard(item.event.uuid)
                        : routes.organizerEventAttendance(item.event.uuid)
                    }
                  >
                    Kelola
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface OrganizerCheckInHighlightProps {
  count: number;
}

export function OrganizerCheckInHighlight({ count }: OrganizerCheckInHighlightProps) {
  return (
    <Card className="border-brand/20 bg-gradient-to-r from-brand/10 to-transparent">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Check-in hari ini</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{count}</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-hover">
          <Link href={routes.scanner}>
            <ScanLine className="size-4" aria-hidden />
            Buka scanner
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

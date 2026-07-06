"use client";

import Link from "next/link";
import { AlertTriangle, BarChart3, Calendar, Download, Plus, ScanLine, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { formatIdr } from "@/lib/format";
import { exportOrganizerTopEventsCsv } from "@/lib/organizer-analytics-export";
import { formatEventDateShort } from "@/lib/datetime";
import { canManageEvents } from "@/lib/permissions";
import { routes } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";
import type {
  OrganizerAttentionItem,
  OrganizerDashboardInsights,
  OrganizerEventInsight,
} from "@/types/organizer";
import type { EventStatus } from "@/types/event";

interface OrganizerDashboardInsightsProps {
  insights?: OrganizerDashboardInsights;
  isLoading?: boolean;
}

function EventInsightRow({
  event,
  trailing,
}: {
  event: OrganizerEventInsight;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 py-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{event.title}</p>
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

function InsightsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function AttentionList({ items }: { items: OrganizerAttentionItem[] }) {
  const user = useAuthStore((s) => s.user);
  const canManage = canManageEvents(user);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Tidak ada event yang perlu perhatian saat ini.</p>
    );
  }

  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={`${item.type}-${item.event.uuid}`} className="py-3">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm">{item.message}</p>
              <p className="font-medium">{item.event.title}</p>
              {canManage ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={routes.organizerEventEdit(item.event.uuid)}>Kelola event</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={routes.organizerEventAttendance(item.event.uuid)}>
                    Lihat kehadiran
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OrganizerDashboardInsightsSection({
  insights,
  isLoading,
}: OrganizerDashboardInsightsProps) {
  const user = useAuthStore((s) => s.user);
  const canCreate = canManageEvents(user);

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {canCreate ? (
          <Button asChild size="sm">
            <Link href={routes.organizerEventNew}>
              <Plus className="mr-2 size-4" />
              Buat event
            </Link>
          </Button>
        ) : null}
        <Button asChild size="sm" variant="outline">
          <Link href={routes.organizerEvents}>
            <Calendar className="mr-2 size-4" />
            Lihat event
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={routes.organizerAnalytics}>
            <BarChart3 className="mr-2 size-4" />
            Analitik
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={routes.scanner}>
            <ScanLine className="mr-2 size-4" />
            Buka scanner
          </Link>
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-medium">Check-in hari ini</p>
            <p className="text-2xl font-bold">{insights.check_in_today.count}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.scanner}>Scan tiket</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4" />
              Event mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.upcoming_events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada event aktif mendatang.</p>
            ) : (
              <div className="divide-y">
                {insights.upcoming_events.map((event) => (
                  <EventInsightRow
                    key={event.uuid}
                    event={event}
                    trailing={
                      canManageEvents(user) ? (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={routes.organizerEventEdit(event.uuid)}>Detail</Link>
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={routes.organizerEventAttendance(event.uuid)}>Kehadiran</Link>
                        </Button>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4" />
              Event terlaris
            </CardTitle>
            {insights.top_events_by_revenue.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportOrganizerTopEventsCsv(insights.top_events_by_revenue)}
              >
                <Download className="mr-1 size-4" />
                CSV
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {insights.top_events_by_revenue.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada penjualan tiket.</p>
            ) : (
              <div className="divide-y">
                {insights.top_events_by_revenue.map((item) => (
                  <EventInsightRow
                    key={item.event.uuid}
                    event={item.event}
                    trailing={
                      <div className="text-right text-sm">
                        <p className="font-semibold">{formatIdr(item.revenue_net)}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.orders_count} order
                        </p>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-amber-600" />
            Perlu perhatian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttentionList items={insights.attention_items} />
        </CardContent>
      </Card>
    </div>
  );
}

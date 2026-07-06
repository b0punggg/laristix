"use client";

import Link from "next/link";
import { Calendar, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { RefreshButton } from "@/components/common/refresh-button";
import { AdminMetricCard } from "@/components/features/admin/admin-metric-card";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { OrganizerInvitationsList } from "@/components/features/organizer/organizer-invitations-list";
import { OrganizerPageHeader } from "@/components/features/organizer/organizer-page-header";
import { useOrganizerScannerDashboardQuery } from "@/hooks/use-organizer-dashboard";
import { routes } from "@/config/env";
import { formatEventDateShort } from "@/lib/datetime";
import { formatNumber } from "@/lib/format";
import type { EventStatus } from "@/types/event";

function formatLastScan(iso: string | null | undefined): string {
  if (!iso) {
    return "Belum ada scan hari ini";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ScannerDashboardPanel() {
  const summaryQuery = useOrganizerScannerDashboardQuery();
  const today = summaryQuery.data?.today;
  const eventsToday = summaryQuery.data?.events_today ?? [];

  return (
    <div className="space-y-6">
      <OrganizerPageHeader
        title="Dashboard Scanner"
        description="Ringkasan tiket yang Anda scan hari ini."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href={routes.scanner}>
                <ScanLine className="mr-2 size-4" />
                Buka scanner
              </Link>
            </Button>
            <RefreshButton
              onRefresh={() => summaryQuery.refetch()}
              isFetching={summaryQuery.isFetching}
              updatedAt={summaryQuery.dataUpdatedAt}
            />
          </div>
        }
      />

      <OrganizerInvitationsList />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminMetricCard
          title="Scan hari ini"
          value={today ? formatNumber(today.scans) : 0}
          subtitle={formatLastScan(today?.last_scan_at)}
          icon={ScanLine}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : summaryQuery.isError ? (
              <p className="text-sm text-destructive">Gagal memuat data scan.</p>
            ) : (today?.scans ?? 0) > 0 ? (
              <p className="text-sm">
                Anda telah memindai <strong>{today?.scans}</strong> tiket hari ini.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada tiket yang di-scan hari ini. Buka scanner untuk memulai.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-4" />
            Scan per event hari ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : eventsToday.length === 0 ? (
            <EmptyState
              icon={ScanLine}
              title="Belum ada scan"
              description="Scan tiket di gate event untuk melihat rincian per event."
            >
              <Button asChild size="sm">
                <Link href={routes.scanner}>Mulai scan</Link>
              </Button>
            </EmptyState>
          ) : (
            <div className="divide-y">
              {eventsToday.map((item) => (
                <div
                  key={item.event.uuid}
                  className="flex flex-wrap items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.event.title}</p>
                      <EventStatusBadge status={item.event.status as EventStatus} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatEventDateShort(item.event.start_at, item.event.timezone)}
                    </p>
                  </div>
                  <p className="text-lg font-bold">{formatNumber(item.scans_today)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Hourglass,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminMetricCard } from "@/components/features/admin/admin-metric-card";
import { routes } from "@/config/env";
import {
  useAdminWaitingRoomQuery,
  usePromoteWaitingRoomEventMutation,
} from "@/hooks/use-admin-waiting-room";
import type { AdminQueueSnapshot } from "@/types/admin";

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("id-ID");
}

function QueueRow({
  queue,
  onPromote,
  isPromoting,
}: {
  queue: AdminQueueSnapshot;
  onPromote: (eventUuid: string) => void;
  isPromoting: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{queue.event.title}</p>
            <Badge variant={queue.queue_active ? "default" : "secondary"}>
              {queue.queue_active ? "Antrean aktif" : "Normal"}
            </Badge>
            {queue.traffic_pressure_percent >= 80 ? (
              <Badge variant="danger">Traffic tinggi</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {queue.event.organizer?.name ?? "Organizer"} · {queue.event.status}
          </p>
          <p className="text-xs text-muted-foreground">
            Aktif sejak: {formatDateTime(queue.queue_activated_at)} · Promote terakhir:{" "}
            {formatDateTime(queue.last_promote_at)}
          </p>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-[360px]">
          <div className="rounded-xl bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">Menunggu</p>
            <p className="text-lg font-semibold">{queue.waiting_count}</p>
          </div>
          <div className="rounded-xl bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">Sedang masuk</p>
            <p className="text-lg font-semibold">{queue.admitted_count}</p>
          </div>
          <div className="rounded-xl bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">Traffic ({queue.traffic_window_seconds}s)</p>
            <p className="text-lg font-semibold">
              {queue.traffic_count}/{queue.traffic_threshold}
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">Admitted rate</p>
            <p className="text-lg font-semibold">{queue.admitted_rate_percent}%</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={routes.publicEvent(queue.event.uuid)} target="_blank">
            Lihat event
          </Link>
        </Button>
        <Button
          size="sm"
          disabled={!queue.queue_active || isPromoting}
          onClick={() => onPromote(queue.event.uuid)}
        >
          {isPromoting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Promote batch
        </Button>
      </div>
    </div>
  );
}

export function AdminWaitingRoomPanel() {
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const { data, isLoading, isError, refetch, isFetching } = useAdminWaitingRoomQuery(
    search,
    activeOnly,
  );
  const promoteMutation = usePromoteWaitingRoomEventMutation();

  const summary = data?.summary;
  const queues = useMemo(() => data?.queues ?? [], [data?.queues]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monitoring Waiting Room</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau antrean virtual per event, tekanan traffic checkout, dan batch admission.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title="Antrean aktif"
          value={summary?.active_queues ?? 0}
          subtitle={`${summary?.tracked_events ?? 0} event terpantau`}
          icon={Hourglass}
          isLoading={isLoading}
          isError={isError}
        />
        <AdminMetricCard
          title="Total menunggu"
          value={summary?.total_waiting ?? 0}
          subtitle={`${summary?.total_admitted ?? 0} sedang masuk checkout`}
          icon={Users}
          isLoading={isLoading}
          isError={isError}
        />
        <AdminMetricCard
          title="Admitted rate rata-rata"
          value={`${summary?.avg_admitted_rate_percent ?? 0}%`}
          subtitle={`${summary?.total_promoted ?? 0} total dipromote`}
          icon={Activity}
          isLoading={isLoading}
          isError={isError}
        />
        <AdminMetricCard
          title="Tekanan traffic puncak"
          value={`${summary?.max_traffic_pressure_percent ?? 0}%`}
          subtitle={`Threshold ${data?.config.traffic_threshold ?? 0}/${data?.config.traffic_window_seconds ?? 10}s`}
          icon={Clock3}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <Card className="rounded-3xl border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base">Antrean per event</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <Select
              value={activeOnly ? "active" : "all"}
              onChange={(event) => setActiveOnly(event.target.value === "active")}
            >
              <option value="all">Semua event terpantau</option>
              <option value="active">Hanya antrean aktif</option>
            </Select>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari event, organizer, atau UUID"
            />
          </div>

          {data?.config ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
              Batch {data.config.admit_batch_size} user / {data.config.admit_interval_seconds}s ·
              Admission token {data.config.admission_token_ttl_seconds}s · Order TTL high-demand{" "}
              {data.config.order_ttl_high_demand_minutes} menit
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : isError ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Gagal memuat data waiting room.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : queues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada event dengan aktivitas waiting room. Antrean akan muncul otomatis saat traffic
              checkout meningkat.
            </p>
          ) : (
            <div className="space-y-3">
              {queues.map((queue) => (
                <QueueRow
                  key={queue.event.uuid}
                  queue={queue}
                  isPromoting={promoteMutation.isPending}
                  onPromote={(eventUuid) => promoteMutation.mutate(eventUuid)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, Eye, Loader2, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "@/components/common/refresh-button";
import { EventSubNav } from "@/components/features/events/event-sub-nav";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { routes } from "@/config/env";
import { useEventQuery } from "@/hooks/use-events";
import { fetchAllEventAttendees, useEventAttendeesQuery } from "@/hooks/use-event-attendees";
import { exportEventAttendeesCsv } from "@/lib/event-attendees-export";
import { cn } from "@/lib/utils";
import { EventOrderDetailDrawer } from "@/components/features/events/event-order-detail-drawer";

interface EventAttendeesPanelProps {
  eventUuid: string;
}

const orderStatusOptions = [
  { value: "all", label: "Semua status" },
  { value: "completed", label: "Selesai" },
  { value: "paid", label: "Dibayar" },
  { value: "awaiting_payment", label: "Menunggu bayar" },
];

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("id-ID");
}

export function EventAttendeesPanel({ eventUuid }: EventAttendeesPanelProps) {
  const eventQuery = useEventQuery(eventUuid);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrderUuid, setSelectedOrderUuid] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const attendeesQuery = useEventAttendeesQuery(eventUuid, {
    search: search || undefined,
    order_status: orderStatus === "all" ? undefined : orderStatus,
    page,
    per_page: 25,
  });

  const attendees = attendeesQuery.data?.data ?? [];
  const meta = attendeesQuery.data?.meta;
  const eventTitle = eventQuery.data?.title ?? "Event";

  const lastUpdated = useMemo(
    () => Math.max(eventQuery.dataUpdatedAt, attendeesQuery.dataUpdatedAt),
    [attendeesQuery.dataUpdatedAt, eventQuery.dataUpdatedAt],
  );

  function applySearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  function openOrderDetail(orderUuid: string | null | undefined) {
    if (!orderUuid) {
      return;
    }

    setSelectedOrderUuid(orderUuid);
    setDetailOpen(true);
  }

  async function handleExportAll() {
    setIsExporting(true);

    try {
      const rows = await fetchAllEventAttendees(eventUuid, {
        search: search || undefined,
        order_status: orderStatus === "all" ? undefined : orderStatus,
      });

      if (rows.length === 0) {
        toast.error("Belum ada data pemesan untuk diunduh.");
        return;
      }

      exportEventAttendeesCsv(rows, eventTitle);
      toast.success(`${rows.length} data pemesan berhasil diunduh.`);
    } catch {
      toast.error("Gagal mengunduh data pemesan.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={routes.organizerEvents}>
          <ArrowLeft className="size-4" />
          Kembali ke event
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="size-6 text-brand" />
            <h1 className="text-2xl font-bold tracking-tight">Data pemesan</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Daftar pembeli dan peserta tiket untuk {eventTitle}. Data diperbarui otomatis setiap 30 detik.
          </p>
        </div>
        <RefreshButton
          onRefresh={() => {
            void eventQuery.refetch();
            void attendeesQuery.refetch();
          }}
          isFetching={eventQuery.isFetching || attendeesQuery.isFetching}
          updatedAt={lastUpdated}
        />
      </div>

      <EventSubNav eventUuid={eventUuid} eventStatus={eventQuery.data?.status} />

      <FormSectionCard
        title="Filter & unduh"
        description="Cari berdasarkan nama, email, no. order, atau kode tiket."
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-1">
            <label htmlFor="attendee-search" className="text-sm font-medium">
              Cari
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="attendee-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applySearch();
                  }
                }}
                placeholder="Nama, email, no. order, kode tiket..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="attendee-status" className="text-sm font-medium">
              Status order
            </label>
            <Select
              id="attendee-status"
              value={orderStatus}
              onChange={(event) => {
                setOrderStatus(event.target.value);
                setPage(1);
              }}
              className="w-full min-w-[180px]"
            >
              {orderStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="outline" onClick={applySearch}>
            Terapkan
          </Button>
          <Button
            className="bg-brand hover:bg-brand-hover"
            disabled={isExporting || (meta?.total ?? 0) === 0}
            onClick={() => void handleExportAll()}
          >
            {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Unduh CSV
          </Button>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Daftar pemesan"
        description={
          meta
            ? `${meta.total} data ditemukan · halaman ${meta.current_page} dari ${meta.last_page}`
            : "Memuat data pemesan..."
        }
      >
        {attendeesQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : attendeesQuery.isError ? (
          <p className="py-8 text-center text-sm text-destructive">Gagal memuat data pemesan.</p>
        ) : attendees.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada data pemesan untuk event ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-3 font-medium">Peserta</th>
                  <th className="pb-3 pr-3 font-medium">Kontak</th>
                  <th className="pb-3 pr-3 font-medium">Tiket</th>
                  <th className="pb-3 pr-3 font-medium">Order</th>
                  <th className="pb-3 pr-3 font-medium">Status</th>
                  <th className="pb-3 pr-3 font-medium">Check-in</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendees.map((attendee) => (
                  <tr key={attendee.uuid}>
                    <td className="py-3 pr-3 align-top">
                      <p className="font-medium text-foreground">{attendee.attendee_name ?? "—"}</p>
                      {attendee.id_number ? (
                        <p className="text-xs text-muted-foreground">KTP: {attendee.id_number}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 align-top text-muted-foreground">
                      <p>{attendee.attendee_email ?? attendee.order?.buyer_email ?? "—"}</p>
                      <p>{attendee.attendee_phone ?? attendee.order?.buyer_phone ?? "—"}</p>
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <p className="font-medium">{attendee.ticket_type_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {attendee.ticket_code ?? "—"} · Seat {attendee.seat_index}
                      </p>
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <p className="font-medium">{attendee.order?.order_number ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {attendee.order?.buyer_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(attendee.order?.paid_at ?? attendee.order?.created_at)}
                      </p>
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <Badge variant="outline" className="capitalize">
                        {attendee.order?.status?.replaceAll("_", " ") ?? attendee.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-3 align-top text-muted-foreground">
                      {attendee.checked_in_at ? formatDateTime(attendee.checked_in_at) : "Belum"}
                    </td>
                    <td className="py-3 align-top">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!attendee.order?.uuid}
                        onClick={() => openOrderDetail(attendee.order?.uuid)}
                      >
                        <Eye className="size-4" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Menampilkan {attendees.length} dari {meta.total} data
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((current) => current + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        ) : null}
      </FormSectionCard>

      <p className={cn("text-center text-xs text-muted-foreground")}>
        Gunakan tombol unduh untuk mengekspor seluruh data sesuai filter aktif.
      </p>

      <EventOrderDetailDrawer
        eventUuid={eventUuid}
        orderUuid={selectedOrderUuid}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

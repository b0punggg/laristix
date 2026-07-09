"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/env";
import { useEventQuery } from "@/hooks/use-events";
import { useTicketTypesQuery } from "@/hooks/use-tickets";
import { formatCurrency } from "@/lib/currency";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { TicketKind, TicketListFilters } from "@/types/ticket";
import { EventSubNav } from "@/components/features/events/event-sub-nav";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { FormSectionCard, FormTabButton } from "@/components/features/events/event-management-ui";
import { TicketActions } from "./ticket-actions";
import { TicketKindBadge } from "./ticket-kind-badge";
import { TicketStatusBadge } from "./ticket-status-badge";
import { cn } from "@/lib/utils";

const kindTabs: Array<{ label: string; value?: TicketKind }> = [
  { label: "Semua", value: undefined },
  { label: "Gratis", value: "free" },
  { label: "Berbayar", value: "paid" },
  { label: "VIP", value: "vip" },
];

interface TicketListPanelProps {
  eventUuid: string;
}

function formatSalesPeriod(start: string | null, end: string | null): string {
  if (!start && !end) return "Selalu terbuka";

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );

  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `Dari ${fmt(start)}`;
  return `Hingga ${fmt(end!)}`;
}

function TicketListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <Skeleton className="mb-3 h-6 w-1/3" />
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="h-9 w-32" />
        </div>
      ))}
    </div>
  );
}

export function TicketListPanel({ eventUuid }: TicketListPanelProps) {
  const user = useAuthStore((s) => s.user);
  const [kind, setKind] = useState<TicketKind | undefined>(undefined);

  const eventQuery = useEventQuery(eventUuid);
  const filters = useMemo<TicketListFilters>(() => ({ kind }), [kind]);
  const ticketsQuery = useTicketTypesQuery(eventUuid, filters);

  const event = eventQuery.data;
  const tickets = ticketsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={routes.organizerEvents}>
            <ArrowLeft className="size-4" />
            Kembali ke event
          </Link>
        </Button>
        {event ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.organizerEventDashboard(eventUuid)}>Dashboard</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Tiket</h1>
            {event ? <EventStatusBadge status={event.status} /> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {event ? (
              <>
                Kelola jenis tiket untuk{" "}
                <span className="font-medium text-foreground">{event.title}</span>
              </>
            ) : (
              "Memuat event..."
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManageEvents(user) ? (
            <Button asChild className="bg-brand hover:bg-brand-hover">
              <Link href={routes.organizerEventTicketNew(eventUuid)}>
                <Plus className="size-4" />
                Buat tiket
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <EventSubNav eventUuid={eventUuid} eventStatus={event?.status} />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
        {kindTabs.map((tab) => (
          <FormTabButton key={tab.label} active={kind === tab.value} onClick={() => setKind(tab.value)}>
            {tab.label}
          </FormTabButton>
        ))}
      </div>

      {ticketsQuery.isLoading ? <TicketListSkeleton /> : null}

      {ticketsQuery.isError ? (
        <FormSectionCard title="Gagal memuat tiket">
          <p className="text-center text-sm text-muted-foreground">Terjadi kesalahan saat memuat daftar tiket.</p>
        </FormSectionCard>
      ) : null}

      {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length === 0 ? (
        <FormSectionCard title="Belum ada tiket">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
              <Ticket className="size-7" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Tambahkan jenis tiket pertama</p>
              <p className="text-sm text-muted-foreground">
                Buat tiket gratis, berbayar, atau VIP dengan kuota dan periode penjualan.
              </p>
            </div>
            {canManageEvents(user) ? (
              <Button asChild className="bg-brand hover:bg-brand-hover">
                <Link href={routes.organizerEventTicketNew(eventUuid)}>Buat tiket</Link>
              </Button>
            ) : null}
          </div>
        </FormSectionCard>
      ) : null}

      {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length > 0 ? (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className={cn(
                "rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
                ticket.status === "archived" && "opacity-80",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <Link
                    href={routes.organizerEventTicketEdit(eventUuid, ticket.id)}
                    className="ds-focus-ring block text-lg font-semibold hover:text-brand"
                  >
                    {ticket.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <TicketKindBadge kind={ticket.kind} />
                    <TicketStatusBadge status={ticket.status} />
                    {ticket.is_sales_open ? (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        Penjualan buka
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Penjualan tutup
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {ticket.is_free ? "Gratis" : formatCurrency(ticket.price, ticket.currency)}
                </p>
              </div>

              {ticket.description ? (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{ticket.description}</p>
              ) : null}

              <div className="mt-4 grid gap-2 rounded-xl bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Kuota: </span>
                  <span className="font-medium">
                    {ticket.available_quantity} / {ticket.quantity} tersedia
                  </span>
                  <span className="text-muted-foreground"> ({ticket.sold_count} terjual)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Per order: </span>
                  {ticket.min_per_order}–{ticket.max_per_order}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Periode penjualan: </span>
                  {formatSalesPeriod(ticket.sales_start_at, ticket.sales_end_at)}
                </div>
              </div>

              <div className="mt-4">
                <TicketActions eventUuid={eventUuid} ticket={ticket} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

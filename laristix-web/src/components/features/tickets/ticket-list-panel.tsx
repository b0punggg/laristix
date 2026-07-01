"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/env";
import { useEventQuery } from "@/hooks/use-events";
import { useTicketTypesQuery } from "@/hooks/use-tickets";
import { formatCurrency } from "@/lib/currency";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { TicketKind, TicketListFilters } from "@/types/ticket";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";
import { TicketActions } from "./ticket-actions";
import { TicketKindBadge } from "./ticket-kind-badge";
import { TicketStatusBadge } from "./ticket-status-badge";

const kindTabs: Array<{ label: string; value?: TicketKind }> = [
  { label: "All", value: undefined },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "VIP", value: "vip" },
];

interface TicketListPanelProps {
  eventUuid: string;
}

function formatSalesPeriod(start: string | null, end: string | null): string {
  if (!start && !end) {
    return "Always open";
  }

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );

  if (start && end) {
    return `${fmt(start)} – ${fmt(end)}`;
  }

  if (start) {
    return `From ${fmt(start)}`;
  }

  return `Until ${fmt(end!)}`;
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.organizerEvents}>
            <ArrowLeft className="size-4" />
            Back to events
          </Link>
        </Button>
        {event ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.organizerEventEdit(eventUuid)}>Edit event</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
          <p className="text-sm text-muted-foreground">
            {event ? (
              <>
                Manage ticket types for <span className="font-medium">{event.title}</span>
              </>
            ) : (
              "Loading event..."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {event ? <EventStatusBadge status={event.status} /> : null}
          {canManageEvents(user) ? (
            <Button asChild>
              <Link href={routes.organizerEventTicketNew(eventUuid)}>
                <Plus className="size-4" />
                New ticket
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {kindTabs.map((tab) => (
          <Button
            key={tab.label}
            variant={kind === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setKind(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {ticketsQuery.isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading tickets...
          </CardContent>
        </Card>
      ) : null}

      {ticketsQuery.isError ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load tickets.
          </CardContent>
        </Card>
      ) : null}

      {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <Ticket className="mx-auto size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No ticket types yet</p>
              <p className="text-sm text-muted-foreground">
                Add free, paid, or VIP tickets with quota and sales period.
              </p>
            </div>
            {canManageEvents(user) ? (
              <Button asChild>
                <Link href={routes.organizerEventTicketNew(eventUuid)}>Create ticket</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length > 0 ? (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{ticket.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <TicketKindBadge kind={ticket.kind} />
                    <TicketStatusBadge status={ticket.status} />
                    {ticket.is_sales_open ? (
                      <span className="text-xs text-emerald-600">Sales open</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sales closed</span>
                    )}
                  </div>
                </div>
                <p className="text-lg font-semibold">
                  {ticket.is_free ? "Free" : formatCurrency(ticket.price, ticket.currency)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.description ? (
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                ) : null}
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Quota: </span>
                    <span className="font-medium">
                      {ticket.available_quantity} / {ticket.quantity} available
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({ticket.sold_count} sold)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Per order: </span>
                    {ticket.min_per_order}–{ticket.max_per_order}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Sales period: </span>
                    {formatSalesPeriod(ticket.sales_start_at, ticket.sales_end_at)}
                  </div>
                </div>
                <TicketActions eventUuid={eventUuid} ticket={ticket} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

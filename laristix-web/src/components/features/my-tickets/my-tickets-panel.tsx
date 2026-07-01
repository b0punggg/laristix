"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Tag, Ticket } from "lucide-react";
import { TicketQrDisplay } from "@/components/features/check-in/ticket-qr-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/env";
import { useMyOrdersQuery } from "@/hooks/use-my-orders";
import { formatVenueLabel } from "@/lib/event-display";
import { formatEventDateShort } from "@/lib/datetime";
import type { CheckoutOrder, OrderStatus } from "@/types/checkout";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Menunggu",
  awaiting_payment: "Menunggu pembayaran",
  paid: "Dibayar",
  completed: "Selesai",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
  partially_refunded: "Sebagian dikembalikan",
};

const statusVariants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  awaiting_payment: "secondary",
  paid: "default",
  completed: "default",
  expired: "destructive",
  cancelled: "destructive",
  refunded: "outline",
  partially_refunded: "outline",
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function OrderCard({ order }: { order: CheckoutOrder }) {
  const hasTickets = order.status === "completed" && order.registrations.length > 0;
  const venueLabel = formatVenueLabel(order.event?.venue);
  const categoryName = order.event?.category?.name;
  const eventSchedule =
    order.event?.start_at
      ? formatEventDateShort(order.event.start_at, order.event.timezone)
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">
            {order.event?.title ?? "Event"}
          </CardTitle>
          {categoryName ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Tag className="size-3.5" />
              {categoryName}
            </div>
          ) : null}
          {eventSchedule ? (
            <p className="text-sm text-muted-foreground">{eventSchedule}</p>
          ) : null}
          {venueLabel ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {venueLabel}
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {order.order_number} · {formatDate(order.created_at)}
          </p>
        </div>
        <Badge variant={statusVariants[order.status]}>
          {statusLabels[order.status] ?? order.status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>Total: {formatCurrency(order.total_amount, order.currency)}</span>
          {order.payment ? (
            <span>Pembayaran: {order.payment.status_label}</span>
          ) : null}
        </div>

        {hasTickets ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Ticket className="size-4" />
              Kode tiket
            </div>
            <ul className="space-y-2">
              {order.registrations.map((registration) => (
                <li
                  key={registration.uuid}
                  className="flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <span className="text-muted-foreground">
                    {registration.attendee_name ?? registration.attendee_email ?? "Peserta"}
                  </span>
                  {registration.ticket ? (
                    <div className="flex items-center gap-3">
                      {registration.ticket.status === "valid" ? (
                        <TicketQrDisplay
                          ticketUuid={registration.ticket.uuid}
                          ticketCode={registration.ticket.ticket_code}
                          status={registration.ticket.status}
                        />
                      ) : (
                        <code className="rounded bg-background px-2 py-1 font-mono text-sm font-semibold">
                          {registration.ticket.ticket_code}
                        </code>
                      )}
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {order.event ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.publicEvent(order.event.uuid)}>Detail event</Link>
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" asChild>
            <Link href={routes.checkoutFinish(order.uuid)}>
              Detail pesanan
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyTicketsPanel() {
  const { data, isLoading, isError, refetch } = useMyOrdersQuery();
  const orders = data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Tiket &amp; Transaksi Saya</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua pesanan dan kode tiket yang telah Anda beli.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Memuat pesanan...</p>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">Gagal memuat pesanan.</p>
          <button
            type="button"
            className="mt-2 text-primary underline-offset-4 hover:underline"
            onClick={() => refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Ticket className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">Belum ada tiket</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pesanan Anda akan muncul di sini setelah checkout.
          </p>
          <Button className="mt-4" asChild>
            <Link href={routes.home}>Jelajahi event</Link>
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.uuid} order={order} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

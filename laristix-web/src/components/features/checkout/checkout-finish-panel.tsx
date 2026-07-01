"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, Clock, MapPin, Tag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/env";
import { useOrderQuery, useValidatePaymentMutation } from "@/hooks/use-checkout";
import { formatVenueLabel } from "@/lib/event-display";
import { formatEventDateShort } from "@/lib/datetime";

interface CheckoutFinishPanelProps {
  orderUuid: string;
}

export function CheckoutFinishPanel({ orderUuid }: CheckoutFinishPanelProps) {
  const orderQuery = useOrderQuery(orderUuid);
  const validateMutation = useValidatePaymentMutation();

  useEffect(() => {
    if (orderQuery.data?.status === "awaiting_payment" && !validateMutation.isPending && !validateMutation.isSuccess) {
      validateMutation.mutate(orderUuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderQuery.data?.status, orderUuid]);

  const order = validateMutation.data?.order ?? orderQuery.data;
  const isLoading = orderQuery.isLoading || validateMutation.isPending;

  if (isLoading) {
    return <p className="text-muted-foreground">Memverifikasi pembayaran...</p>;
  }

  if (!order) {
    return <p className="text-destructive">Pesanan tidak ditemukan.</p>;
  }

  const isSuccess = order.status === "completed";
  const isPending = order.status === "awaiting_payment" || order.status === "pending";
  const venueLabel = formatVenueLabel(order.event?.venue);
  const categoryName = order.event?.category?.name;
  const eventSchedule =
    order.event?.start_at
      ? formatEventDateShort(order.event.start_at, order.event.timezone)
      : null;

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      {isSuccess ? (
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
      ) : isPending ? (
        <Clock className="mx-auto size-16 text-amber-500" />
      ) : (
        <XCircle className="mx-auto size-16 text-destructive" />
      )}

      <div>
        <h1 className="text-2xl font-bold">
          {isSuccess ? "Pembayaran berhasil" : isPending ? "Menunggu pembayaran" : "Pembayaran gagal"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pesanan <span className="font-medium">{order.order_number}</span>
        </p>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle className="text-lg">{order.event?.title ?? "Event"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {categoryName ? (
            <p className="flex items-center gap-1 text-muted-foreground">
              <Tag className="size-3.5" />
              {categoryName}
            </p>
          ) : null}
          {eventSchedule ? <p className="text-muted-foreground">{eventSchedule}</p> : null}
          {venueLabel ? (
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {venueLabel}
            </p>
          ) : null}
          <p>
            Status pesanan: <span className="font-medium">{order.status}</span>
          </p>
          {order.payment ? (
            <p>
              Status pembayaran:{" "}
              <span className="font-medium">{order.payment.status_label}</span>
            </p>
          ) : null}
          {isSuccess && order.registrations.length > 0 ? (
            <div className="pt-2">
              <p className="font-medium">Tiket Anda:</p>
              <ul className="mt-2 space-y-1">
                {order.registrations.map((reg) => (
                  <li key={reg.uuid} className="text-muted-foreground">
                    {reg.ticket?.ticket_code ?? reg.uuid}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {isSuccess ? (
          <Button asChild>
            <Link href={routes.myTickets}>Lihat semua tiket</Link>
          </Button>
        ) : null}
        {order.event ? (
          <Button variant="outline" asChild>
            <Link href={routes.publicEvent(order.event.uuid)}>Kembali ke event</Link>
          </Button>
        ) : null}
        <Button asChild>
          <Link href={routes.home}>Beranda</Link>
        </Button>
      </div>
    </div>
  );
}

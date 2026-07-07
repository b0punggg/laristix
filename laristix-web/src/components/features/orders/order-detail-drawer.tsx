"use client";

import Link from "next/link";
import {
  Calendar,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Tag,
  Ticket,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { routes } from "@/config/env";
import { useOrderQuery } from "@/hooks/use-checkout";
import { formatVenueLabel } from "@/lib/event-display";
import { formatEventDateShort } from "@/lib/datetime";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getOrderTransactionDate,
  isSuccessfulOrderStatus,
} from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderDetailDrawerProps {
  orderUuid: string | null;
  summary?: CheckoutOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreviewInvoice: (order: CheckoutOrder) => void;
  onRequestRefund: (order: CheckoutOrder) => void;
}

export function OrderDetailDrawer({
  orderUuid,
  summary,
  open,
  onOpenChange,
  onPreviewInvoice,
  onRequestRefund,
}: OrderDetailDrawerProps) {
  const orderQuery = useOrderQuery(orderUuid ?? "", open && Boolean(orderUuid));
  const order = orderQuery.data ?? summary;
  const isLoading = orderQuery.isLoading && !summary;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-md sm:max-w-lg">
        <DrawerHeader className="border-b border-border/80 pb-4">
          <DrawerTitle>Detail order</DrawerTitle>
          <DrawerDescription>
            {order ? order.order_number : "Memuat detail transaksi..."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : null}

          {!isLoading && order ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge order={order} />
                <span className="text-xs text-muted-foreground">
                  {formatTransactionDate(getOrderTransactionDate(order), order.event?.timezone)}
                </span>
              </div>

              <section className="space-y-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold">{order.event?.title ?? "Event"}</h3>
                {order.event?.category?.name ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="size-3.5" aria-hidden />
                    {order.event.category.name}
                  </p>
                ) : null}
                {order.event?.start_at ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-3.5" aria-hidden />
                    {formatEventDateShort(order.event.start_at, order.event.timezone)}
                  </p>
                ) : null}
                {formatVenueLabel(order.event?.venue) ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden />
                    {formatVenueLabel(order.event?.venue)}
                  </p>
                ) : null}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Pembeli</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <User className="size-3.5" aria-hidden />
                    {order.buyer_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="size-3.5" aria-hidden />
                    {order.buyer_email}
                  </p>
                  {order.buyer_phone ? (
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5" aria-hidden />
                      {order.buyer_phone}
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Item tiket</h3>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.ticket_type_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatTransactionAmount(item.unit_price, order.currency)}
                        </p>
                      </div>
                      <p className="font-medium tabular-nums">
                        {formatTransactionAmount(item.subtotal, order.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2 rounded-2xl border border-border/80 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatTransactionAmount(order.subtotal, order.currency)}</span>
                </div>
                {order.discount_amount > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diskon</span>
                    <span>-{formatTransactionAmount(order.discount_amount, order.currency)}</span>
                  </div>
                ) : null}
                {order.platform_fee_total > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biaya platform</span>
                    <span>{formatTransactionAmount(order.platform_fee_total, order.currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-border/80 pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatTransactionAmount(order.total_amount, order.currency)}
                  </span>
                </div>
              </section>

              {order.payment ? (
                <section className="space-y-2 rounded-2xl border border-border/80 bg-muted/20 p-4 text-sm">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <CreditCard className="size-4" aria-hidden />
                    Pembayaran
                  </h3>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Gateway</span>
                    <span className="capitalize">{order.payment.gateway}</span>
                  </div>
                  {order.payment.payment_method ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Metode</span>
                      <span>{order.payment.payment_method}</span>
                    </div>
                  ) : null}
                  {order.payment.paid_at ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Dibayar</span>
                      <span>{formatTransactionDate(order.payment.paid_at, order.event?.timezone)}</span>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {order.registrations.some((r) => r.ticket?.ticket_code) ? (
                <section className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Ticket className="size-4" aria-hidden />
                    Kode tiket
                  </h3>
                  <ul className="space-y-1.5">
                    {order.registrations
                      .filter((r) => r.ticket?.ticket_code)
                      .map((registration) => (
                        <li
                          key={registration.uuid}
                          className="rounded-lg bg-muted/40 px-3 py-2 font-mono text-xs"
                        >
                          {registration.ticket?.ticket_code}
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}

          {!isLoading && !order ? (
            <p className="text-sm text-muted-foreground">Order tidak ditemukan.</p>
          ) : null}
        </div>

        {order ? (
          <DrawerFooter className="border-t border-border/80 pt-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => onPreviewInvoice(order)}>
                <FileText className="size-4" />
                Preview invoice
              </Button>
              {isSuccessfulOrderStatus(order.status) &&
              order.status !== "refunded" &&
              order.status !== "partially_refunded" ? (
                <Button variant="outline" onClick={() => onRequestRefund(order)}>
                  <RotateCcw className="size-4" />
                  Ajukan refund
                </Button>
              ) : null}
              <Button asChild className="sm:col-span-2 bg-brand hover:bg-brand-hover">
                <Link href={routes.checkoutFinish(order.uuid)}>Buka halaman pembayaran</Link>
              </Button>
            </div>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

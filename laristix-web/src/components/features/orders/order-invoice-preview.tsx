"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getOrderTransactionDate,
} from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderInvoicePreviewProps {
  order: CheckoutOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderInvoicePreview({ order, open, onOpenChange }: OrderInvoicePreviewProps) {
  if (!order) {
    return null;
  }

  const invoiceDate = getOrderTransactionDate(order);

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto print:max-h-none print:shadow-none">
        <DialogHeader>
          <DialogTitle>Preview invoice</DialogTitle>
          <DialogDescription>
            Ringkasan transaksi untuk order {order.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm print:border-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/80 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">Laristix</p>
              <h2 className="mt-1 text-xl font-bold">Invoice</h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{order.order_number}</p>
            </div>
            <div className="text-right text-sm">
              <OrderStatusBadge order={order} />
              <p className="mt-2 text-muted-foreground">
                {formatTransactionDate(invoiceDate, order.event?.timezone)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ditagihkan ke</p>
              <p className="mt-2 font-medium">{order.buyer_name}</p>
              <p className="text-sm text-muted-foreground">{order.buyer_email}</p>
              {order.buyer_phone ? (
                <p className="text-sm text-muted-foreground">{order.buyer_phone}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</p>
              <p className="mt-2 font-medium">{order.event?.title ?? "—"}</p>
              {order.event?.venue?.city ? (
                <p className="text-sm text-muted-foreground">{order.event.venue.city}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border/80">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Harga</th>
                  <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="px-4 py-3">{item.ticket_type_name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatTransactionAmount(item.unit_price, order.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatTransactionAmount(item.subtotal, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatTransactionAmount(order.subtotal, order.currency)}</span>
            </div>
            {order.discount_amount > 0 ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Diskon</span>
                <span className="tabular-nums">
                  -{formatTransactionAmount(order.discount_amount, order.currency)}
                </span>
              </div>
            ) : null}
            {order.platform_fee_total > 0 ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Biaya platform</span>
                <span className="tabular-nums">
                  {formatTransactionAmount(order.platform_fee_total, order.currency)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-border/80 pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatTransactionAmount(order.total_amount, order.currency)}</span>
            </div>
          </div>

          {order.payment ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Pembayaran via {order.payment.gateway}
              {order.payment.payment_method ? ` · ${order.payment.payment_method}` : ""}
              {order.payment.paid_at
                ? ` · Dibayar ${formatTransactionDate(order.payment.paid_at, order.event?.timezone)}`
                : ""}
            </p>
          ) : null}
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handlePrint} className="bg-brand hover:bg-brand-hover">
            <Printer className="size-4" />
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

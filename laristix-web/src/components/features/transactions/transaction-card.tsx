"use client";

import Link from "next/link";
import { Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getOrderTransactionDate,
  getTransactionStatusDisplay,
} from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";

interface TransactionCardProps {
  order: CheckoutOrder;
}

export function TransactionCard({ order }: TransactionCardProps) {
  const status = getTransactionStatusDisplay(order);
  const eventTitle = order.event?.title ?? "Event";
  const bannerUrl = order.event?.banner_url;
  const transactionDate = getOrderTransactionDate(order);

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 px-4 py-2">
        <p className="font-mono text-xs text-muted-foreground">{order.order_number}</p>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-40">
          {bannerUrl ? (
            <img src={bannerUrl} alt={eventTitle} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
              <Ticket className="size-8 opacity-70" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-base font-bold leading-snug">{eventTitle}</h3>
          <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground/80">Tanggal Transaksi</span>
            <br />
            {formatTransactionDate(transactionDate, order.event?.timezone)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-base font-semibold">
              {formatTransactionAmount(order.total_amount, order.currency)}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            asChild
          >
            <Link href={routes.checkoutFinish(order.uuid)}>Lihat Detail</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

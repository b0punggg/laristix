"use client";

import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getOrderTransactionDate,
} from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";
import { OrderStatusBadge } from "./order-status-badge";

interface OrdersTableProps {
  orders: CheckoutOrder[];
  onViewDetail: (order: CheckoutOrder) => void;
  onPreviewInvoice: (order: CheckoutOrder) => void;
  onRequestRefund: (order: CheckoutOrder) => void;
}

export function OrdersTable({
  orders,
  onViewDetail,
  onPreviewInvoice,
  onRequestRefund,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">No. Order</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const transactionDate = getOrderTransactionDate(order);

                return (
                  <tr
                    key={order.uuid}
                    className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(order)}
                        className="ds-focus-ring font-mono text-xs font-medium text-foreground hover:text-brand"
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td className="max-w-[220px] px-4 py-3.5">
                      <p className="truncate font-medium">{order.event?.title ?? "Event"}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.buyer_name}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-muted-foreground">
                      {formatTransactionDate(transactionDate, order.event?.timezone)}
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge order={order} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium tabular-nums">
                      {formatTransactionAmount(order.total_amount, order.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onViewDetail(order)}>
                          <Eye className="size-4" />
                          Detail
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Menu aksi</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onPreviewInvoice(order)}>
                              Preview invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRequestRefund(order)}>
                              Ajukan refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {orders.map((order) => {
          const transactionDate = getOrderTransactionDate(order);

          return (
            <article
              key={order.uuid}
              className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onViewDetail(order)}
                  className="ds-focus-ring font-mono text-xs font-medium hover:text-brand"
                >
                  {order.order_number}
                </button>
                <OrderStatusBadge order={order} />
              </div>

              <h3 className="mt-2 font-semibold leading-snug">{order.event?.title ?? "Event"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatTransactionDate(transactionDate, order.event?.timezone)}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-base font-bold tabular-nums">
                  {formatTransactionAmount(order.total_amount, order.currency)}
                </p>
                <Button size="sm" variant="outline" onClick={() => onViewDetail(order)}>
                  Detail
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

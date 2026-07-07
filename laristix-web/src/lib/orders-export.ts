import { downloadCsv } from "@/lib/export-csv";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getOrderTransactionDate,
  getTransactionStatusDisplay,
} from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";

export function exportOrdersCsv(orders: CheckoutOrder[]) {
  downloadCsv(
    `transaksi-${new Date().toISOString().slice(0, 10)}.csv`,
    [
      "No. Order",
      "Event",
      "Status",
      "Tanggal",
      "Subtotal",
      "Diskon",
      "Biaya platform",
      "Total",
      "Mata uang",
      "Pembeli",
      "Email",
    ],
    orders.map((order) => {
      const status = getTransactionStatusDisplay(order);
      const date = getOrderTransactionDate(order);

      return [
        order.order_number,
        order.event?.title ?? "",
        status.label,
        formatTransactionDate(date, order.event?.timezone),
        order.subtotal,
        order.discount_amount,
        order.platform_fee_total,
        order.total_amount,
        order.currency,
        order.buyer_name,
        order.buyer_email,
      ];
    }),
  );
}

export function formatOrderSummary(order: CheckoutOrder): string {
  return `${order.order_number} — ${formatTransactionAmount(order.total_amount, order.currency)}`;
}

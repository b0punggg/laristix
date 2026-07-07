import type { CheckoutOrder, OrderStatus } from "@/types/checkout";

export type TransactionFilter =
  | "all"
  | "payment_success"
  | "payment_expired"
  | "payment_cancelled"
  | "waiting_for_payment";

export const transactionFilterOptions: Array<{ value: TransactionFilter; label: string }> = [
  { value: "all", label: "Semua transaksi" },
  { value: "payment_success", label: "Pembayaran berhasil" },
  { value: "payment_expired", label: "Pembayaran kedaluwarsa" },
  { value: "payment_cancelled", label: "Pembayaran dibatalkan" },
  { value: "waiting_for_payment", label: "Menunggu pembayaran" },
];

export interface TransactionStatusDisplay {
  label: string;
  className: string;
  badgeVariant: "success" | "warning" | "danger" | "muted" | "secondary";
}

export function getTransactionStatusDisplay(order: CheckoutOrder): TransactionStatusDisplay {
  if (order.status === "refunded" || order.payment?.status_label === "refunded") {
    return {
      label: "Refunded",
      className: "bg-red-50 text-red-600",
      badgeVariant: "danger",
    };
  }

  if (order.status === "partially_refunded") {
    return {
      label: "Partially Refunded",
      className: "bg-orange-50 text-orange-700",
      badgeVariant: "warning",
    };
  }

  if (order.status === "completed" || order.status === "paid" || order.payment?.status_label === "paid") {
    return {
      label: "Payment Success",
      className: "bg-emerald-50 text-emerald-700",
      badgeVariant: "success",
    };
  }

  if (order.status === "expired" || order.payment?.status_label === "expired") {
    return {
      label: "Payment Expired",
      className: "bg-gray-100 text-gray-600",
      badgeVariant: "muted",
    };
  }

  if (order.status === "cancelled" || order.payment?.status_label === "failed") {
    return {
      label: "Payment Cancelled",
      className: "bg-red-50 text-red-600",
      badgeVariant: "danger",
    };
  }

  if (
    order.status === "pending" ||
    order.status === "awaiting_payment" ||
    order.payment?.status_label === "pending"
  ) {
    return {
      label: "Waiting for Payment",
      className: "bg-amber-50 text-amber-700",
      badgeVariant: "warning",
    };
  }

  return {
    label: "Payment Success",
    className: "bg-emerald-50 text-emerald-700",
    badgeVariant: "success",
  };
}

export function matchesTransactionFilter(
  order: CheckoutOrder,
  filter: TransactionFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  const status = getTransactionStatusDisplay(order).label;

  switch (filter) {
    case "payment_success":
      return status === "Payment Success";
    case "payment_expired":
      return status === "Payment Expired";
    case "payment_cancelled":
      return status === "Payment Cancelled" || status === "Refunded" || status === "Partially Refunded";
    case "waiting_for_payment":
      return status === "Waiting for Payment";
    default:
      return true;
  }
}

export function formatTransactionDate(value: string, timezone = "Asia/Jakarta"): string {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(value));

  return `${formatted} WIB`;
}

export function formatTransactionAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getOrderTransactionDate(order: CheckoutOrder): string {
  return order.paid_at ?? order.created_at;
}

export function isSuccessfulOrderStatus(status: OrderStatus): boolean {
  return status === "completed" || status === "paid";
}

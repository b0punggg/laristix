"use client";

import {
  CalendarClock,
  CreditCard,
  FileText,
  Globe,
  Receipt,
  ShoppingBag,
  Ticket,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEventOrderQuery } from "@/hooks/use-event-attendees";
import { formatCurrency } from "@/lib/currency";

interface EventOrderDetailDrawerProps {
  eventUuid: string;
  orderUuid: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("id-ID");
}

function formatGender(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  if (value === "male") {
    return "Laki-laki";
  }

  if (value === "female") {
    return "Perempuan";
  }

  return value;
}

function invoiceBadgeVariant(status: string): "default" | "secondary" | "danger" | "outline" {
  if (status === "paid" || status === "issued") {
    return "default";
  }

  if (status === "pending") {
    return "secondary";
  }

  if (status === "failed" || status === "expired" || status === "cancelled" || status === "refunded") {
    return "danger";
  }

  return "outline";
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function EventOrderDetailDrawer({
  eventUuid,
  orderUuid,
  open,
  onOpenChange,
}: EventOrderDetailDrawerProps) {
  const orderQuery = useEventOrderQuery(eventUuid, orderUuid, open);
  const order = orderQuery.data;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-md sm:max-w-xl">
        <DrawerHeader className="border-b border-border/80 pb-4">
          <DrawerTitle>Detail pemesanan</DrawerTitle>
          <DrawerDescription>
            {order?.order_number ?? "Memuat detail transaksi..."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4">
          {orderQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-40 rounded-full" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : null}

          {orderQuery.isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              Gagal memuat detail pemesanan.
            </p>
          ) : null}

          {order ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={invoiceBadgeVariant(order.invoice_status)}>
                  {order.invoice_status_label}
                </Badge>
                <Badge variant="outline">{order.transaction_type_label}</Badge>
              </div>

              <section className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Receipt className="size-4 text-brand" />
                  Ringkasan transaksi
                </h3>
                <div className="divide-y">
                  <DetailRow label="Nomor pesanan" value={order.order_number} />
                  <DetailRow label="Waktu pemesanan" value={formatDateTime(order.created_at)} />
                  <DetailRow label="Waktu bayar" value={formatDateTime(order.paid_at)} />
                  <DetailRow label="Jenis transaksi" value={order.transaction_type_label} />
                  <DetailRow
                    label="Sumber pembelian"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="size-3.5" />
                        {order.purchase_source}
                      </span>
                    }
                  />
                  <DetailRow label="Status invoice" value={order.invoice_status_label} />
                  <DetailRow
                    label="Status order"
                    value={order.status.replaceAll("_", " ")}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <User className="size-4 text-brand" />
                  Data pembeli
                </h3>
                <div className="divide-y">
                  <DetailRow label="Nama" value={order.buyer_name} />
                  <DetailRow label="Email" value={order.buyer_email} />
                  <DetailRow label="Telepon" value={order.buyer_phone ?? "—"} />
                  <DetailRow label="KTP" value={order.buyer_id_number ?? "—"} />
                  <DetailRow label="Tanggal lahir" value={order.buyer_date_of_birth ?? "—"} />
                  <DetailRow label="Jenis kelamin" value={formatGender(order.buyer_gender)} />
                </div>
              </section>

              <section className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Ticket className="size-4 text-brand" />
                  Tiket
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={`${item.ticket_type_name}-${index}`} className="rounded-xl border bg-background p-3 text-sm">
                      <p className="font-medium">{item.ticket_type_name}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unit_price, order.currency)} ={" "}
                        {formatCurrency(item.subtotal, order.currency)}
                      </p>
                    </div>
                  ))}
                  {order.tickets.map((ticket) => (
                    <div key={ticket.uuid} className="rounded-xl border bg-background p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{ticket.attendee_name ?? "Peserta"}</p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.ticket_type_name ?? "Tiket"} · Seat {ticket.seat_index}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Kode: {ticket.ticket_code ?? "—"}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {ticket.registration_status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      {ticket.custom_answers.length > 0 ? (
                        <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                          {ticket.custom_answers.map((answer) => (
                            <p key={`${ticket.uuid}-${answer.label}`}>
                              <span className="font-medium text-foreground">{answer.label}:</span>{" "}
                              {String(answer.value ?? "—")}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <ShoppingBag className="size-4 text-brand" />
                  Rincian pembayaran
                </h3>
                <div className="divide-y">
                  <DetailRow label="Subtotal" value={formatCurrency(order.subtotal, order.currency)} />
                  {order.discount_amount > 0 ? (
                    <DetailRow
                      label="Diskon"
                      value={`-${formatCurrency(order.discount_amount, order.currency)}`}
                    />
                  ) : null}
                  {order.promo_code ? <DetailRow label="Promo" value={order.promo_code} /> : null}
                  {order.coupon_code ? <DetailRow label="Kupon" value={order.coupon_code} /> : null}
                  <DetailRow
                    label="Biaya layanan"
                    value={formatCurrency(order.platform_fee_total, order.currency)}
                  />
                  <DetailRow
                    label="Total dibayar"
                    value={formatCurrency(order.total_amount, order.currency)}
                  />
                  <DetailRow
                    label="Pencairan organizer"
                    value={formatCurrency(order.organizer_net_amount, order.currency)}
                  />
                </div>
              </section>

              {order.payment ? (
                <section className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="size-4 text-brand" />
                    Pembayaran
                  </h3>
                  <div className="divide-y">
                    <DetailRow label="Gateway" value={order.payment.gateway} />
                    <DetailRow label="Metode" value={order.payment.payment_method ?? "—"} />
                    <DetailRow label="Status" value={order.payment.status} />
                    <DetailRow
                      label="Jumlah"
                      value={formatCurrency(order.payment.amount, order.currency)}
                    />
                    <DetailRow
                      label="Dibayar pada"
                      value={formatDateTime(order.payment.paid_at)}
                    />
                  </div>
                </section>
              ) : null}

              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Selesai: {formatDateTime(order.completed_at)}
              </p>

              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="size-3.5" />
                Invoice mengikuti status pembayaran dan penerbitan tiket di sistem.
              </p>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

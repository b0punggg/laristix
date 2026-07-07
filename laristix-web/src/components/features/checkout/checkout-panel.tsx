"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Gift,
  Loader2,
  Lock,
  Minus,
  Percent,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { TicketKindBadge } from "@/components/features/tickets/ticket-kind-badge";
import { routes } from "@/config/env";
import { usePublicEventQuery, usePublicTicketsQuery } from "@/hooks/use-public-events";
import { useCheckoutMutation } from "@/hooks/use-checkout";
import { useMeQuery } from "@/hooks/use-auth";
import { formatEventDateShort } from "@/lib/datetime";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMidtransSnap } from "./use-midtrans-snap";

interface CheckoutPanelProps {
  eventUuid: string;
  ticketTypeId: number;
}

export function CheckoutPanel({ eventUuid, ticketTypeId }: CheckoutPanelProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const storedUser = useAuthStore((s) => s.user);
  const { data: me } = useMeQuery(isHydrated);
  const currentUser = me ?? storedUser;

  const eventQuery = usePublicEventQuery(eventUuid);
  const ticketsQuery = usePublicTicketsQuery(eventUuid);
  const checkoutMutation = useCheckoutMutation(eventUuid);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [orderUuid, setOrderUuid] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const ticket = useMemo(
    () => ticketsQuery.data?.find((t) => t.id === ticketTypeId),
    [ticketsQuery.data, ticketTypeId],
  );

  const total = ticket ? ticket.price * quantity : 0;
  const venue = eventQuery.data?.venue;
  const venueLabel = [venue?.name, venue?.city].filter(Boolean).join(", ");
  const eventSchedule = eventQuery.data?.start_at
    ? formatEventDateShort(eventQuery.data.start_at, eventQuery.data.timezone)
    : null;
  const countdownTarget = ticket?.sales_end_at ?? eventQuery.data?.start_at ?? null;

  const countdownLabel = useMemo(() => {
    if (!countdownTarget) return null;
    const diff = new Date(countdownTarget).getTime() - now;
    if (Number.isNaN(diff) || diff <= 0) return "Berakhir";
    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}h ${hours}j ${minutes}m`;
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
  }, [countdownTarget, now]);

  useEffect(() => {
    if (!countdownTarget) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => window.clearInterval(interval);
  }, [countdownTarget]);

  useMidtransSnap({
    snapToken: snapToken ?? "",
    clientKey,
    onSuccess: () => {
      if (orderUuid) {
        router.push(routes.checkoutFinish(orderUuid));
      }
    },
    onPending: () => {
      if (orderUuid) {
        router.push(routes.checkoutFinish(orderUuid));
      }
    },
    onError: () => {
      if (orderUuid) {
        router.push(routes.checkoutFinish(orderUuid));
      }
    },
  });

  useEffect(() => {
    if (ticket) {
      setQuantity(ticket.min_per_order);
    }
  }, [ticket]);

  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.name);
      setBuyerEmail(currentUser.email);
      setBuyerPhone(currentUser.phone ?? "");
    }
  }, [currentUser]);

  function changeQuantity(nextValue: number) {
    if (!ticket) return;
    const safeValue = Math.min(
      Math.max(nextValue, ticket.min_per_order),
      Math.min(ticket.max_per_order, Math.max(ticket.available_quantity, ticket.min_per_order)),
    );
    setQuantity(safeValue);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      return;
    }

    checkoutMutation.mutate(
      {
        ticket_type_id: ticketTypeId,
        quantity,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone || undefined,
      },
      {
        onSuccess: (data) => {
          setOrderUuid(data.order.uuid);

          if (data.order.status === "completed") {
            router.push(routes.checkoutFinish(data.order.uuid));
            return;
          }

          if (data.snap_token) {
            setSnapToken(data.snap_token);
            setClientKey(data.client_key);
          }
        },
      },
    );
  };

  if (eventQuery.isLoading || ticketsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-36" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-[540px] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!ticket || !ticket.is_purchasable) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href={routes.publicEvent(eventUuid)}>
            <ArrowLeft className="size-4" />
            Kembali ke event
          </Link>
        </Button>
        <p className="text-destructive">Tiket tidak tersedia untuk dibeli.</p>
      </div>
    );
  }

  const ctaLabel = checkoutMutation.isPending
    ? "Memproses..."
    : snapToken
      ? "Menunggu pembayaran..."
      : ticket.is_free
        ? "Konfirmasi tiket gratis"
        : "Lanjut ke pembayaran";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href={routes.publicEvent(eventUuid)}>
          <ArrowLeft className="size-4" />
          Kembali ke event
        </Link>
      </Button>

      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/70 backdrop-blur">
              <ShieldCheck className="size-3.5 text-brand" />
              Checkout aman dengan pembayaran terenkripsi
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Checkout</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Selesaikan pembelian tiket Anda dengan pengalaman checkout yang cepat, aman,
                dan mobile-friendly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full bg-background/80 px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border/70">
                {eventQuery.data?.title}
              </div>
              {eventSchedule ? (
                <div className="rounded-full bg-background/80 px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border/70">
                  {eventSchedule}
                </div>
              ) : null}
              {venueLabel ? (
                <div className="rounded-full bg-background/80 px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border/70">
                  {venueLabel}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                  <Clock3 className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Countdown</p>
                  <p className="text-sm font-semibold">{countdownLabel ?? "Tersedia selama stok ada"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                  <Lock className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pembayaran</p>
                  <p className="text-sm font-semibold">Midtrans Snap</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kepercayaan</p>
                  <p className="text-sm font-semibold">Checkout resmi Laristix</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start"
      >
        <div className="space-y-6">
          <FormSectionCard
            title="Selected Tickets"
            description="Atur jumlah tiket yang ingin Anda beli."
          >
            <div className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{ticket.name}</p>
                  <TicketKindBadge kind={ticket.kind} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {ticket.description || "Tiket resmi untuk event pilihan Anda."}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border/70">
                    Min {ticket.min_per_order}
                  </span>
                  <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border/70">
                    Maks {ticket.max_per_order}
                  </span>
                  <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border/70">
                    Tersisa {ticket.available_quantity}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <p className="text-lg font-bold tabular-nums">
                  {ticket.is_free ? "Gratis" : formatCurrency(ticket.price, ticket.currency)}
                </p>
                <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl"
                    onClick={() => changeQuantity(quantity - 1)}
                    disabled={quantity <= ticket.min_per_order}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min={ticket.min_per_order}
                    max={ticket.max_per_order}
                    value={quantity}
                    onChange={(e) => changeQuantity(Number(e.target.value) || ticket.min_per_order)}
                    required
                    className="h-10 w-20 border-0 text-center shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl"
                    onClick={() => changeQuantity(quantity + 1)}
                    disabled={
                      quantity >= ticket.max_per_order || quantity >= ticket.available_quantity
                    }
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard
            title="Order Summary"
            description="Tinjau detail pembelian sebelum lanjut ke pembayaran."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Event</p>
                <p className="mt-2 font-semibold">{eventQuery.data?.title}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Jumlah tiket</p>
                <p className="mt-2 font-semibold">{quantity} tiket</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Harga per tiket</p>
                <p className="mt-2 font-semibold">
                  {ticket.is_free ? "Gratis" : formatCurrency(ticket.price, ticket.currency)}
                </p>
              </div>
              <div className="rounded-2xl border border-brand/20 bg-brand-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Total pembayaran</p>
                <p className="mt-2 text-lg font-bold tabular-nums text-foreground">
                  {ticket.is_free ? "Gratis" : formatCurrency(total, ticket.currency)}
                </p>
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard
            title="Buyer Details"
            description="Data ini digunakan untuk pengiriman invoice dan tiket."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="buyer_name" label="Nama lengkap" required className="sm:col-span-2">
                <Input
                  id="buyer_name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="h-11"
                  required
                />
              </FormField>
              <FormField id="buyer_email" label="Email" required>
                <Input
                  id="buyer_email"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </FormField>
              <FormField id="buyer_phone" label="No. telepon">
                <Input
                  id="buyer_phone"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="h-11"
                  placeholder="Opsional"
                />
              </FormField>
            </div>
          </FormSectionCard>

          <FormSectionCard
            title="Promo Code"
            description="Ruang promo tersedia tanpa mengubah integrasi pembayaran saat ini."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="promo-code" className="text-sm font-medium">
                  Promo
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Percent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="promo-code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="h-11 pl-9"
                      placeholder="PROMO2026"
                    />
                  </div>
                  <Button type="button" variant="outline" disabled>
                    Apply
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="coupon-code" className="text-sm font-medium">
                  Coupon
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Gift className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="coupon-code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-11 pl-9"
                      placeholder="COUPON"
                    />
                  </div>
                  <Button type="button" variant="outline" disabled>
                    Apply
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="referral-code" className="text-sm font-medium">
                  Referral
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Users className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="referral-code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="h-11 pl-9"
                      placeholder="REFERRAL"
                    />
                  </div>
                  <Button type="button" variant="outline" disabled>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Kolom promo, coupon, dan referral disiapkan untuk pengalaman checkout tanpa
              mengubah integrasi backend atau pembayaran saat ini.
            </p>
          </FormSectionCard>

          <FormSectionCard
            title="Payment Method"
            description="Pembayaran diproses lewat gateway yang sama seperti sebelumnya."
          >
            <div className="rounded-2xl border border-brand/20 bg-brand-muted/30 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-background text-brand ring-1 ring-border/70">
                    <CreditCard className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Midtrans Snap</p>
                    <p className="text-sm text-muted-foreground">
                      Kartu, transfer bank, e-wallet, dan metode lain yang tersedia di Snap.
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border/70">
                  Payment integration unchanged
                </div>
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard
            title="Terms"
            description="Konfirmasi bahwa Anda memahami detail pembelian."
          >
            <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <Checkbox
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                Saya menyetujui syarat pembelian, memahami kebijakan refund dari organizer,
                dan memastikan data pembeli yang saya isi sudah benar.
              </span>
            </label>
          </FormSectionCard>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="space-y-4 rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Sticky Summary</p>
                <p className="text-xs text-muted-foreground">Ringkasan pesanan Anda</p>
              </div>
              <Sparkles className="size-5 text-brand" />
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                  <Ticket className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{ticket.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{eventQuery.data?.title}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Jenis tiket</span>
                <span className="font-medium">{ticket.kind.toUpperCase()}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Harga</span>
                <span className="font-medium">
                  {ticket.is_free ? "Gratis" : formatCurrency(ticket.price, ticket.currency)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-medium">Termasuk</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-border/80 pt-3 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold tabular-nums">
                  {ticket.is_free ? "Gratis" : formatCurrency(total, ticket.currency)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-muted/35 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                <p>
                  Invoice dikirim ke email pembeli. Tiket akan tersedia setelah pembayaran
                  berhasil diverifikasi.
                </p>
              </div>
            </div>

            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-border/70 p-3">
                <p className="font-medium text-foreground">Trusted Payment</p>
                <p className="mt-1">Diproses aman lewat gateway resmi.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-3">
                <p className="font-medium text-foreground">Instant Confirmation</p>
                <p className="mt-1">Status pembayaran diperbarui di halaman selesai.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-3">
                <p className="font-medium text-foreground">Mobile Optimized</p>
                <p className="mt-1">Ringkasan tetap mudah diakses di layar kecil.</p>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-brand text-base hover:bg-brand-hover"
              disabled={checkoutMutation.isPending || Boolean(snapToken) || !agreed}
            >
              {checkoutMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {ctaLabel}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Dengan melanjutkan, Anda akan memakai integrasi pembayaran yang sama seperti
              sebelumnya.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

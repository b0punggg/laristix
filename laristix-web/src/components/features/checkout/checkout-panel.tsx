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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { TicketKindBadge } from "@/components/features/tickets/ticket-kind-badge";
import { routes } from "@/config/env";
import { usePublicEventQuery, usePublicTicketsQuery } from "@/hooks/use-public-events";
import { useCheckoutMutation, useCheckoutQuoteQuery } from "@/hooks/use-checkout";
import { getApiErrorMessage } from "@/lib/api/client";
import { usePublicRegistrationFormQuery } from "@/hooks/use-phase-c";
import { useMeQuery } from "@/hooks/use-auth";
import { formatEventDateShort } from "@/lib/datetime";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMidtransSnap } from "./use-midtrans-snap";
import { CheckoutRegistrationFields } from "./checkout-registration-fields";
import { CheckoutAttendeeFields } from "./checkout-attendee-fields";
import { Select } from "@/components/ui/select";
import {
  parseEventCheckoutSettings,
  type CheckoutAttendeePayload,
} from "@/lib/event-checkout-settings";

interface CheckoutPanelProps {
  eventUuid: string;
  ticketTypeId: number;
  initialQuantity?: number;
}

export function CheckoutPanel({
  eventUuid,
  ticketTypeId,
  initialQuantity = 1,
}: CheckoutPanelProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const storedUser = useAuthStore((s) => s.user);
  const { data: me } = useMeQuery(isHydrated);
  const currentUser = me ?? storedUser;

  const eventQuery = usePublicEventQuery(eventUuid);
  const ticketsQuery = usePublicTicketsQuery(eventUuid);
  const registrationFormQuery = usePublicRegistrationFormQuery(eventUuid);
  const checkoutMutation = useCheckoutMutation(eventUuid);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerIdNumber, setBuyerIdNumber] = useState("");
  const [buyerDateOfBirth, setBuyerDateOfBirth] = useState("");
  const [buyerGender, setBuyerGender] = useState("");
  const [attendees, setAttendees] = useState<CheckoutAttendeePayload[]>([]);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | undefined>(undefined);
  const [couponCode, setCouponCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [registrationAnswers, setRegistrationAnswers] = useState<Record<number, string | boolean>>({});
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [orderUuid, setOrderUuid] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const ticket = useMemo(
    () => ticketsQuery.data?.find((t) => t.id === ticketTypeId),
    [ticketsQuery.data, ticketTypeId],
  );

  const checkoutSettings = useMemo(
    () => parseEventCheckoutSettings(eventQuery.data?.settings),
    [eventQuery.data?.settings],
  );

  const effectiveMaxPerOrder = useMemo(() => {
    if (!ticket) {
      return 1;
    }

    if (checkoutSettings.max_tickets_per_transaction === null) {
      return ticket.max_per_order;
    }

    return Math.min(ticket.max_per_order, checkoutSettings.max_tickets_per_transaction);
  }, [checkoutSettings.max_tickets_per_transaction, ticket]);

  const quoteQuery = useCheckoutQuoteQuery(
    eventUuid,
    ticketTypeId,
    quantity,
    appliedPromoCode,
    Boolean(ticket && !ticket.is_free),
  );

  const subtotal = quoteQuery.data?.subtotal ?? (ticket ? ticket.price * quantity : 0);
  const discountAmount = quoteQuery.data?.discount_amount ?? 0;
  const total = quoteQuery.data?.total_amount ?? subtotal;
  const platformFee = quoteQuery.data?.platform_fee_total ?? 0;
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
      const nextQuantity = Math.min(
        Math.max(initialQuantity, ticket.min_per_order),
        Math.min(effectiveMaxPerOrder, ticket.available_quantity),
      );
      setQuantity(nextQuantity);
    }
  }, [ticket, initialQuantity, effectiveMaxPerOrder]);

  useEffect(() => {
    if (!checkoutSettings.one_attendee_per_ticket) {
      return;
    }

    setAttendees((current) => {
      const next = [...current];
      while (next.length < quantity) {
        next.push({ name: "" });
      }
      return next.slice(0, quantity);
    });
  }, [checkoutSettings.one_attendee_per_ticket, quantity]);

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
      Math.min(effectiveMaxPerOrder, Math.max(ticket.available_quantity, ticket.min_per_order)),
    );
    setQuantity(safeValue);
  }

  function updateAttendee(index: number, patch: Partial<CheckoutAttendeePayload>) {
    setAttendees((current) =>
      current.map((attendee, attendeeIndex) =>
        attendeeIndex === index ? { ...attendee, ...patch } : attendee,
      ),
    );
  }

  function updateAttendeeAnswer(index: number, fieldId: number, value: string | boolean) {
    setAttendees((current) =>
      current.map((attendee, attendeeIndex) => {
        if (attendeeIndex !== index) {
          return attendee;
        }

        const answers = { ...(attendee.answers ?? []).reduce<Record<number, string | boolean>>(
          (acc, item) => {
            acc[item.field_id] = item.value ?? "";
            return acc;
          },
          {},
        ) };
        answers[fieldId] = value;

        return {
          ...attendee,
          answers: Object.entries(answers)
            .filter(([, answerValue]) => answerValue !== "" && answerValue !== false)
            .map(([fieldIdKey, answerValue]) => ({
              field_id: Number(fieldIdKey),
              value: answerValue,
            })),
        };
      }),
    );
  }

  function applyPromoCode() {
    const nextCode = promoCode.trim().toUpperCase();

    if (!nextCode) {
      toast.error("Masukkan kode promo terlebih dahulu.");
      return;
    }

    setAppliedPromoCode(nextCode);
  }

  function removePromoCode() {
    setAppliedPromoCode(undefined);
    setPromoCode("");
  }

  useEffect(() => {
    if (!appliedPromoCode || !quoteQuery.isError) {
      return;
    }

    toast.error(getApiErrorMessage(quoteQuery.error));
    setAppliedPromoCode(undefined);
  }, [appliedPromoCode, quoteQuery.error, quoteQuery.isError]);

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
        buyer_id_number: buyerIdNumber || undefined,
        buyer_date_of_birth: buyerDateOfBirth || undefined,
        buyer_gender: buyerGender || undefined,
        answers: checkoutSettings.one_attendee_per_ticket
          ? undefined
          : Object.entries(registrationAnswers)
              .filter(([, value]) => value !== "" && value !== false)
              .map(([fieldId, value]) => ({
                field_id: Number(fieldId),
                value,
              })),
        attendees: checkoutSettings.one_attendee_per_ticket ? attendees : undefined,
        promo_code: appliedPromoCode,
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
                    Maks {effectiveMaxPerOrder}
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
                    max={effectiveMaxPerOrder}
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
                      quantity >= effectiveMaxPerOrder || quantity >= ticket.available_quantity
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
            description={
              checkoutSettings.one_attendee_per_ticket
                ? "Data kontak pemesan untuk invoice dan notifikasi."
                : "Data ini digunakan untuk pengiriman invoice dan tiket."
            }
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
              {checkoutSettings.buyer_fields.phone.enabled ? (
                <FormField
                  id="buyer_phone"
                  label="No. telepon"
                  required={checkoutSettings.buyer_fields.phone.required}
                >
                  <Input
                    id="buyer_phone"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="h-11"
                    required={checkoutSettings.buyer_fields.phone.required}
                    placeholder={checkoutSettings.buyer_fields.phone.required ? undefined : "Opsional"}
                  />
                </FormField>
              ) : null}
              {checkoutSettings.buyer_fields.id_number.enabled ? (
                <FormField
                  id="buyer_id_number"
                  label="No. KTP"
                  required={checkoutSettings.buyer_fields.id_number.required}
                  className="sm:col-span-2"
                >
                  <Input
                    id="buyer_id_number"
                    value={buyerIdNumber}
                    onChange={(e) => setBuyerIdNumber(e.target.value)}
                    className="h-11"
                    required={checkoutSettings.buyer_fields.id_number.required}
                  />
                </FormField>
              ) : null}
              {checkoutSettings.buyer_fields.date_of_birth.enabled ? (
                <FormField
                  id="buyer_date_of_birth"
                  label="Tanggal lahir"
                  required={checkoutSettings.buyer_fields.date_of_birth.required}
                >
                  <Input
                    id="buyer_date_of_birth"
                    type="date"
                    value={buyerDateOfBirth}
                    onChange={(e) => setBuyerDateOfBirth(e.target.value)}
                    className="h-11"
                    required={checkoutSettings.buyer_fields.date_of_birth.required}
                  />
                </FormField>
              ) : null}
              {checkoutSettings.buyer_fields.gender.enabled ? (
                <FormField
                  id="buyer_gender"
                  label="Jenis kelamin"
                  required={checkoutSettings.buyer_fields.gender.required}
                >
                  <Select
                    id="buyer_gender"
                    value={buyerGender}
                    onChange={(e) => setBuyerGender(e.target.value)}
                    required={checkoutSettings.buyer_fields.gender.required}
                  >
                    <option value="">Pilih</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                    <option value="other">Lainnya</option>
                  </Select>
                </FormField>
              ) : null}
            </div>
            {!checkoutSettings.one_attendee_per_ticket ? (
              <div className="mt-5">
                <CheckoutRegistrationFields
                  fields={registrationFormQuery.data?.fields ?? []}
                  values={registrationAnswers}
                  onChange={(fieldId, value) =>
                    setRegistrationAnswers((current) => ({ ...current, [fieldId]: value }))
                  }
                />
              </div>
            ) : null}
          </FormSectionCard>

          {checkoutSettings.one_attendee_per_ticket ? (
            <FormSectionCard
              title="Data pemegang tiket"
              description="Isi data untuk setiap tiket dalam transaksi ini."
            >
              <CheckoutAttendeeFields
                quantity={quantity}
                attendees={attendees}
                registrationFields={registrationFormQuery.data?.fields ?? []}
                onChange={updateAttendee}
                onAnswerChange={updateAttendeeAnswer}
              />
            </FormSectionCard>
          ) : null}

          <FormSectionCard
            title="Kode Promo"
            description="Masukkan kode promo event untuk mendapatkan diskon."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <label htmlFor="promo-code" className="text-sm font-medium">
                  Promo
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Percent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="promo-code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="h-11 pl-9"
                      placeholder="PROMO2026"
                      disabled={Boolean(appliedPromoCode)}
                    />
                  </div>
                  {appliedPromoCode ? (
                    <Button type="button" variant="outline" onClick={removePromoCode}>
                      <X className="size-4" />
                      Hapus
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={quoteQuery.isFetching}
                    >
                      {quoteQuery.isFetching && appliedPromoCode === undefined ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Terapkan
                    </Button>
                  )}
                </div>
                {appliedPromoCode && quoteQuery.data?.promo_code ? (
                  <p className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="size-4" />
                    Promo {quoteQuery.data.promo_code} diterapkan
                    {quoteQuery.data.promo_description
                      ? ` — ${quoteQuery.data.promo_description}`
                      : ""}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 opacity-60">
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
                      disabled
                    />
                  </div>
                  <Button type="button" variant="outline" disabled>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Kupon dan referral akan tersedia pada fase berikutnya.
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
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {ticket.is_free ? "Gratis" : formatCurrency(subtotal, ticket.currency)}
                </span>
              </div>
              {discountAmount > 0 ? (
                <div className="flex justify-between gap-3 text-emerald-600">
                  <span>Promo {quoteQuery.data?.promo_code ? `(${quoteQuery.data.promo_code})` : ""}</span>
                  <span className="font-medium">
                    -{formatCurrency(discountAmount, ticket.currency)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-medium">
                  {ticket.is_free
                    ? "—"
                    : platformFee > 0
                      ? formatCurrency(platformFee, ticket.currency)
                      : "Termasuk"}
                </span>
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

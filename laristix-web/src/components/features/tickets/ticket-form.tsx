"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FormSaveIndicator,
  FormSectionCard,
  FormTabButton,
} from "@/components/features/events/event-management-ui";
import { routes } from "@/config/env";
import { useEventQuery } from "@/hooks/use-events";
import {
  useCreateTicketMutation,
  useTicketTypeQuery,
  useUpdateTicketMutation,
} from "@/hooks/use-tickets";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { TicketKind, TicketType } from "@/types/ticket";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { TicketActions } from "./ticket-actions";
import { TicketKindBadge } from "./ticket-kind-badge";
import { TicketSalesPeriodEditor } from "./ticket-sales-period-editor";
import { TicketStatusBadge } from "./ticket-status-badge";

const schema = z
  .object({
    kind: z.enum(["free", "paid", "vip"]),
    name: z.string().max(255).optional(),
    description: z.string().optional(),
    price: z.string().optional(),
    quantity: z.string().min(1, "Kuota wajib diisi."),
    min_per_order: z.string().optional(),
    max_per_order: z.string().optional(),
    sales_start_at: z.string().optional(),
    sales_end_at: z.string().optional(),
    visibility: z.enum(["public", "hidden", "invite_only"]),
    status: z.enum(["active", "sold_out", "hidden", "archived"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind !== "free") {
      const price = Number(data.price);
      if (!data.price || Number.isNaN(price) || price <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harga harus lebih dari 0 untuk tiket berbayar dan VIP.",
          path: ["price"],
        });
      }
    }

    if (data.sales_start_at && data.sales_end_at) {
      if (new Date(data.sales_end_at) <= new Date(data.sales_start_at)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Akhir penjualan harus setelah mulai penjualan.",
          path: ["sales_end_at"],
        });
      }
    }
  });

type TicketFormValues = z.infer<typeof schema>;
type TicketTab = "details" | "pricing" | "sales" | "status";

const kindOptions: Array<{ value: TicketKind; label: string; hint: string }> = [
  { value: "free", label: "Gratis", hint: "Tanpa biaya — harga selalu 0." },
  { value: "paid", label: "Berbayar", hint: "Tiket standar berbayar." },
  { value: "vip", label: "VIP", hint: "Tier premium dengan harga lebih tinggi." },
];

function ticketToFormValues(ticket: TicketType): TicketFormValues {
  return {
    kind: ticket.kind,
    name: ticket.name,
    description: ticket.description ?? "",
    price: ticket.is_free ? "" : String(ticket.price),
    quantity: String(ticket.quantity),
    min_per_order: String(ticket.min_per_order),
    max_per_order: String(ticket.max_per_order),
    sales_start_at: toDatetimeLocalValue(ticket.sales_start_at),
    sales_end_at: toDatetimeLocalValue(ticket.sales_end_at),
    visibility: ticket.visibility,
    status: ticket.status,
  };
}

interface TicketFormProps {
  eventUuid: string;
  mode: "create" | "edit";
  ticketId?: number;
}

export function TicketForm({ eventUuid, mode, ticketId }: TicketFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = mode === "edit" && ticketId !== undefined;

  const eventQuery = useEventQuery(eventUuid);
  const ticketQuery = useTicketTypeQuery(eventUuid, ticketId ?? 0, Boolean(isEdit));
  const createMutation = useCreateTicketMutation(eventUuid);
  const updateMutation = useUpdateTicketMutation(eventUuid, ticketId ?? 0);

  const [tab, setTab] = useState<TicketTab>("details");
  const [justSaved, setJustSaved] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: "paid",
      name: "",
      description: "",
      price: "",
      quantity: "100",
      min_per_order: "1",
      max_per_order: "10",
      sales_start_at: "",
      sales_end_at: "",
      visibility: "public",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const selectedKind = useWatch({ control, name: "kind" });
  const salesStart = useWatch({ control, name: "sales_start_at" });
  const salesEnd = useWatch({ control, name: "sales_end_at" });

  useEffect(() => {
    if (!isEdit && !canManageEvents(user)) {
      router.replace(routes.organizerEventTickets(eventUuid));
    }
  }, [isEdit, user, router, eventUuid]);

  useEffect(() => {
    if (ticketQuery.data) {
      reset(ticketToFormValues(ticketQuery.data));
    }
  }, [ticketQuery.data, reset]);

  useEffect(() => {
    if (isSubmitSuccessful || updateMutation.isSuccess) {
      setJustSaved(true);
      const timer = window.setTimeout(() => setJustSaved(false), 3000);
      return () => window.clearTimeout(timer);
    }
  }, [isSubmitSuccessful, updateMutation.isSuccess]);

  const onSubmit = (values: TicketFormValues) => {
    const salesStartAt = values.sales_start_at
      ? fromDatetimeLocalValue(values.sales_start_at)
      : null;
    const salesEndAt = values.sales_end_at ? fromDatetimeLocalValue(values.sales_end_at) : null;
    const effectiveKind = isEdit ? ticket?.kind : values.kind;
    const isFreeKind = effectiveKind === "free";

    if (isEdit) {
      updateMutation.mutate({
        name: values.name || undefined,
        description: values.description || null,
        price: isFreeKind ? 0 : Number(values.price),
        quantity: Number(values.quantity),
        min_per_order: Number(values.min_per_order || 1),
        max_per_order: Number(values.max_per_order || 10),
        sales_start_at: salesStartAt,
        sales_end_at: salesEndAt,
        visibility: values.visibility,
        status: values.status,
      });
      return;
    }

    createMutation.mutate({
      kind: values.kind,
      name: values.name || undefined,
      description: values.description || undefined,
      price: isFreeKind ? 0 : Number(values.price),
      quantity: Number(values.quantity),
      min_per_order: Number(values.min_per_order || 1),
      max_per_order: Number(values.max_per_order || 10),
      sales_start_at: salesStartAt,
      sales_end_at: salesEndAt,
      visibility: values.visibility,
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const event = eventQuery.data;
  const ticket = ticketQuery.data;
  const showPrice = isEdit ? ticket?.kind !== "free" : selectedKind !== "free";

  const salesRegister = register as unknown as UseFormRegister<{
    sales_start_at?: string;
    sales_end_at?: string;
  }>;
  const salesErrors = errors as FieldErrors<{
    sales_start_at?: string;
    sales_end_at?: string;
  }>;

  if (isEdit && ticketQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isEdit && ticketQuery.isError) {
    return (
      <FormSectionCard title="Tiket tidak ditemukan">
        <p className="text-sm text-muted-foreground">Tiket tidak ditemukan atau Anda tidak memiliki akses.</p>
      </FormSectionCard>
    );
  }

  const tabs: Array<{ id: TicketTab; label: string }> = [
    { id: "details", label: "Detail" },
    { id: "pricing", label: "Harga & kuota" },
    { id: "sales", label: "Periode penjualan" },
    ...(isEdit ? [{ id: "status" as const, label: "Status" }] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={routes.organizerEventTickets(eventUuid)}>
            <ArrowLeft className="size-4" />
            Kembali ke tiket
          </Link>
        </Button>
        {isEdit ? (
          <FormSaveIndicator isDirty={isDirty} isSaving={isPending} lastSaved={justSaved && !isDirty} />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {isEdit ? "Edit tiket" : "Buat tiket baru"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {event ? (
              <>
                Event: <span className="font-medium text-foreground">{event.title}</span>
              </>
            ) : (
              "Atur jenis tiket, kuota, harga, dan periode penjualan."
            )}
          </p>
        </div>
        {ticket ? (
          <div className="flex items-center gap-2">
            <TicketKindBadge kind={ticket.kind} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-6">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
              {tabs.map((item) => (
                <FormTabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
                  {item.label}
                </FormTabButton>
              ))}
            </div>

            {tab === "details" ? (
              <FormSectionCard title="Detail tiket" description="Informasi yang ditampilkan ke peserta.">
                <div className="space-y-5">
                  {!isEdit ? (
                    <FormField id="kind" label="Jenis tiket" required>
                      <Select id="kind" className="h-11" {...register("kind")}>
                        {kindOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {kindOptions.find((o) => o.value === selectedKind)?.hint}
                      </p>
                    </FormField>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Jenis tiket</p>
                      {ticket ? <TicketKindBadge kind={ticket.kind} /> : null}
                      <p className="text-xs text-muted-foreground">Jenis tidak dapat diubah setelah dibuat.</p>
                    </div>
                  )}

                  <FormField id="name" label="Nama">
                    <Input
                      id="name"
                      className="h-11"
                      placeholder={
                        selectedKind === "free"
                          ? "Tiket Gratis"
                          : selectedKind === "vip"
                            ? "Tiket VIP"
                            : "Tiket Reguler"
                      }
                      {...register("name")}
                    />
                  </FormField>

                  <FormField id="description" label="Deskripsi">
                    <Textarea id="description" rows={4} placeholder="Manfaat atau ketentuan tiket..." {...register("description")} />
                  </FormField>

                  <FormField id="visibility" label="Visibilitas">
                    <Select id="visibility" className="h-11" {...register("visibility")}>
                      <option value="public">Public</option>
                      <option value="hidden">Hidden</option>
                      <option value="invite_only">Invite only</option>
                    </Select>
                  </FormField>
                </div>
              </FormSectionCard>
            ) : null}

            {tab === "pricing" ? (
              <FormSectionCard title="Harga & kuota" description="Tentukan harga dan batas pembelian.">
                <div className="grid gap-5 sm:grid-cols-2">
                  {showPrice ? (
                    <FormField id="price" label="Harga (IDR)" required error={errors.price?.message}>
                      <Input id="price" type="number" min={1} step={1000} className="h-11" {...register("price")} />
                    </FormField>
                  ) : null}

                  <FormField
                    id="quantity"
                    label="Kuota"
                    required
                    error={errors.quantity?.message}
                    className={showPrice ? undefined : "sm:col-span-2"}
                  >
                    <Input id="quantity" type="number" min={1} className="h-11" {...register("quantity")} />
                  </FormField>

                  <FormField id="min_per_order" label="Min per order">
                    <Input id="min_per_order" type="number" min={1} className="h-11" {...register("min_per_order")} />
                  </FormField>

                  <FormField id="max_per_order" label="Max per order">
                    <Input id="max_per_order" type="number" min={1} className="h-11" {...register("max_per_order")} />
                  </FormField>
                </div>
              </FormSectionCard>
            ) : null}

            {tab === "sales" ? (
              <FormSectionCard title="Periode penjualan" description="Batasi kapan tiket dapat dibeli.">
                <TicketSalesPeriodEditor
                  register={salesRegister}
                  errors={salesErrors}
                  startValue={salesStart}
                  endValue={salesEnd}
                />
              </FormSectionCard>
            ) : null}

            {tab === "status" && isEdit ? (
              <FormSectionCard
                title="Status tiket"
                description="Arsipkan tiket yang tidak lagi dijual tanpa menghapus data."
              >
                <FormField id="status" label="Status" helpText="Pilih 'Archived' untuk mengarsipkan tiket.">
                  <Select id="status" className="h-11" {...register("status")}>
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                    <option value="archived">Archived</option>
                    <option value="sold_out">Sold out</option>
                  </Select>
                </FormField>
              </FormSectionCard>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href={routes.organizerEventTickets(eventUuid)}>Batal</Link>
              </Button>
              <Button type="submit" disabled={isPending} className="bg-brand hover:bg-brand-hover">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : isEdit ? (
                  "Simpan perubahan"
                ) : (
                  "Buat tiket"
                )}
              </Button>
            </div>
          </div>

          {ticket ? (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <FormSectionCard title="Aksi">
                <TicketActions eventUuid={eventUuid} ticket={ticket} layout="stack" />
              </FormSectionCard>
            </aside>
          ) : null}
        </div>
      </form>
    </div>
  );
}

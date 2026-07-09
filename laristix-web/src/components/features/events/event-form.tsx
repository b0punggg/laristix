"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FormSaveIndicator,
  FormSectionCard,
  FormTabButton,
  FormWizardProgress,
  type FormWizardStep,
} from "@/components/features/events/event-management-ui";
import { EventImageUploader } from "@/components/features/events/event-image-uploader";
import { EventScheduleEditor } from "@/components/features/events/event-schedule-editor";
import { routes } from "@/config/env";
import {
  useCreateEventMutation,
  useCreateVenueMutation,
  useEventCategoriesQuery,
  useEventQuery,
  useEventVenuesQuery,
  useUpdateEventMutation,
} from "@/hooks/use-events";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import { buildEventSettings, parseEventContact, parseEventTerms } from "@/lib/event-settings";
import { canManageEvents } from "@/lib/permissions";
import { ticketApi } from "@/services/ticket/ticket-api";
import { useAuthStore } from "@/stores/auth-store";
import type { Event } from "@/types/event";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { EventActions } from "./event-actions";
import { EventStatusBadge } from "./event-status-badge";
import { EventOnboardingBanner, isEventOnboardingMode } from "./event-onboarding-banner";
import { EventTaxonomyFields } from "./event-taxonomy-fields";
import { VenueQuickAdd } from "./venue-quick-add";

const formObject = z.object({
  banner_url: z.string().url("Masukkan URL yang valid.").optional().or(z.literal("")),
  title: z.string().min(1, "Judul wajib diisi.").max(255),
  slug: z.string().max(255).optional(),
  short_description: z.string().max(500).optional(),
  description: z.string().optional(),
  start_at: z.string().min(1, "Waktu mulai wajib diisi."),
  end_at: z.string().min(1, "Waktu selesai wajib diisi."),
  timezone: z.string().min(1, "Zona waktu wajib diisi."),
  event_format: z.enum(["offline", "online"]),
  venue_id: z.string().optional(),
  online_url: z.string().url("Masukkan URL streaming yang valid.").optional().or(z.literal("")),
  category_ids: z.array(z.string()).min(1, "Pilih minimal satu kategori."),
  tag_ids: z.array(z.string()).optional(),
  capacity: z.string().optional(),
  is_free: z.boolean(),
  visibility: z.enum(["public", "private", "unlisted"]),
  terms: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email("Email PIC tidak valid.").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  create_ticket: z.boolean(),
  ticket_name: z.string().optional(),
  ticket_kind: z.enum(["free", "paid"]),
  ticket_price: z.string().optional(),
  ticket_quantity: z.string().optional(),
});

type EventFormValues = z.infer<typeof formObject> & {
  contact_name: string;
  contact_email: string;
};

function withSharedRefines<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .refine((data: EventFormValues) => new Date(data.end_at) > new Date(data.start_at), {
      message: "Waktu selesai harus setelah waktu mulai.",
      path: ["end_at"],
    })
    .refine(
      (data: EventFormValues) => {
        if (data.event_format === "offline") {
          return Boolean(data.venue_id?.trim());
        }

        return Boolean(data.venue_id?.trim()) || Boolean(data.online_url?.trim());
      },
      {
        message: "Pilih venue atau isi link streaming untuk event online.",
        path: ["venue_id"],
      },
    );
}

const createSchema = withSharedRefines(
  formObject
    .extend({
      contact_name: z.string().min(1, "Nama PIC wajib diisi."),
      contact_email: z.string().email("Email PIC tidak valid."),
    })
    .refine(
      (data) => {
        if (!data.create_ticket) {
          return true;
        }

        return Boolean(data.ticket_name?.trim()) && Boolean(data.ticket_quantity?.trim());
      },
      {
        message: "Nama dan kuota tiket wajib diisi.",
        path: ["ticket_name"],
      },
    )
    .refine(
      (data) => {
        if (!data.create_ticket || data.ticket_kind !== "paid") {
          return true;
        }

        const price = Number(data.ticket_price);
        return !Number.isNaN(price) && price > 0;
      },
      {
        message: "Harga tiket berbayar wajib diisi.",
        path: ["ticket_price"],
      },
    ),
);

const editSchema = withSharedRefines(formObject);

const wizardSteps: FormWizardStep[] = [
  { id: "media", label: "Banner", description: "Gambar utama" },
  { id: "details", label: "Detail", description: "Judul & deskripsi" },
  { id: "schedule", label: "Jadwal", description: "Waktu event" },
  { id: "location", label: "Lokasi", description: "Format & venue" },
  { id: "policy", label: "Ketentuan", description: "Syarat & kontak" },
  { id: "ticket", label: "Tiket", description: "Tipe tiket pertama" },
];

const mediaFields: (keyof EventFormValues)[] = ["banner_url"];
const detailFields: (keyof EventFormValues)[] = [
  "title",
  "slug",
  "short_description",
  "description",
  "visibility",
];
const scheduleFields: (keyof EventFormValues)[] = ["start_at", "end_at", "timezone"];
const locationFields: (keyof EventFormValues)[] = [
  "event_format",
  "venue_id",
  "online_url",
  "category_ids",
  "tag_ids",
  "capacity",
];
const policyFields: (keyof EventFormValues)[] = [
  "terms",
  "contact_name",
  "contact_email",
  "contact_phone",
];
const ticketFields: (keyof EventFormValues)[] = [
  "create_ticket",
  "ticket_name",
  "ticket_kind",
  "ticket_price",
  "ticket_quantity",
];

type EditTab = "details" | "schedule" | "location" | "media" | "policy";

function toOptionalNumber(value: string | undefined): number | null | undefined {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toOptionalId(value: string | undefined): number | null | undefined {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function eventToFormValues(event: Event): EventFormValues {
  const contact = parseEventContact(event.settings);
  const isOnlineVenue = event.venue?.type === "online";

  return {
    banner_url: event.banner_url ?? "",
    title: event.title,
    slug: event.slug,
    short_description: event.short_description ?? "",
    description: event.description ?? "",
    start_at: toDatetimeLocalValue(event.start_at),
    end_at: toDatetimeLocalValue(event.end_at),
    timezone: event.timezone,
    event_format: isOnlineVenue ? "online" : "offline",
    venue_id: event.venue?.id ? String(event.venue.id) : "",
    online_url: "",
    category_ids:
      event.categories && event.categories.length > 0
        ? event.categories.map((category) => String(category.id))
        : event.category?.id
          ? [String(event.category.id)]
          : [],
    tag_ids: event.tags?.map((tag) => String(tag.id)) ?? [],
    capacity: event.capacity ? String(event.capacity) : "",
    is_free: event.is_free,
    visibility: event.visibility,
    terms: parseEventTerms(event.settings),
    contact_name: contact.name,
    contact_email: contact.email,
    contact_phone: contact.phone ?? "",
    create_ticket: false,
    ticket_name: "",
    ticket_kind: event.is_free ? "free" : "paid",
    ticket_price: "",
    ticket_quantity: "100",
  };
}

interface EventFormProps {
  mode: "create" | "edit";
  uuid?: string;
}

export function EventForm({ mode, uuid }: EventFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isEdit = mode === "edit" && uuid;
  const showOnboarding = !isEdit && isEventOnboardingMode(searchParams);
  const eventQuery = useEventQuery(uuid ?? "", Boolean(isEdit));
  const venuesQuery = useEventVenuesQuery();
  const categoriesQuery = useEventCategoriesQuery();
  const createVenueMutation = useCreateVenueMutation();
  const createMutation = useCreateEventMutation({ redirectTo: false });
  const updateMutation = useUpdateEventMutation(uuid ?? "");

  const [wizardStep, setWizardStep] = useState(0);
  const [editTab, setEditTab] = useState<EditTab>("details");
  const [justSaved, setJustSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      banner_url: "",
      title: "",
      slug: "",
      short_description: "",
      description: "",
      start_at: "",
      end_at: "",
      timezone: "Asia/Jakarta",
      event_format: "offline",
      venue_id: "",
      online_url: "",
      category_ids: [],
      tag_ids: [],
      capacity: "",
      is_free: false,
      visibility: "public",
      terms: "",
      contact_name: user?.name ?? "",
      contact_email: user?.email ?? "",
      contact_phone: "",
      create_ticket: true,
      ticket_name: "Reguler",
      ticket_kind: "paid",
      ticket_price: "50000",
      ticket_quantity: "100",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    trigger,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const startAt = useWatch({ control, name: "start_at" });
  const endAt = useWatch({ control, name: "end_at" });
  const eventFormat = useWatch({ control, name: "event_format" });
  const isFree = useWatch({ control, name: "is_free" });
  const createTicket = useWatch({ control, name: "create_ticket" });
  const ticketKind = useWatch({ control, name: "ticket_kind" });
  const categoryIds = useWatch({ control, name: "category_ids" }) ?? [];
  const tagIds = useWatch({ control, name: "tag_ids" }) ?? [];

  useEffect(() => {
    if (!isEdit && !canManageEvents(user)) {
      router.replace(routes.organizerEvents);
    }
  }, [isEdit, user, router]);

  useEffect(() => {
    if (eventQuery.data) {
      reset(eventToFormValues(eventQuery.data));
    }
  }, [eventQuery.data, reset]);

  useEffect(() => {
    if (isSubmitSuccessful || updateMutation.isSuccess) {
      setJustSaved(true);
      const timer = window.setTimeout(() => setJustSaved(false), 3000);
      return () => window.clearTimeout(timer);
    }
  }, [isSubmitSuccessful, updateMutation.isSuccess]);

  useEffect(() => {
    if (isFree) {
      setValue("ticket_kind", "free", { shouldDirty: true });
    }
  }, [isFree, setValue]);

  async function resolveVenueId(values: EventFormValues): Promise<number> {
    const existingVenueId = toOptionalId(values.venue_id);
    if (existingVenueId) {
      return existingVenueId;
    }

    if (values.event_format === "online") {
      const venue = await createVenueMutation.mutateAsync({
        name: values.title.trim() || "Event Online",
        type: "online",
        online_url: values.online_url?.trim() ?? "",
      });
      return venue.id;
    }

    throw new Error("Venue wajib dipilih.");
  }

  const onSubmit = async (values: EventFormValues) => {
    const settings = buildEventSettings(isEdit ? (eventQuery.data?.settings ?? null) : null, {
      terms: values.terms,
      contact:
        values.contact_name?.trim() && values.contact_email?.trim()
          ? {
              name: values.contact_name,
              email: values.contact_email,
              phone: values.contact_phone,
            }
          : undefined,
    });

    if (isEdit) {
      updateMutation.mutate({
        title: values.title,
        short_description: values.short_description || undefined,
        description: values.description || undefined,
        banner_url: values.banner_url || null,
        start_at: fromDatetimeLocalValue(values.start_at),
        end_at: fromDatetimeLocalValue(values.end_at),
        timezone: values.timezone,
        venue_id: toOptionalId(values.venue_id) as number,
        category_id: Number(values.category_ids[0]),
        category_ids: values.category_ids.map(Number),
        tag_ids: values.tag_ids?.map(Number),
        capacity: toOptionalNumber(values.capacity),
        is_free: values.is_free,
        visibility: values.visibility,
        settings,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const venueId = await resolveVenueId(values);
      const response = await createMutation.mutateAsync({
        title: values.title,
        slug: values.slug || undefined,
        short_description: values.short_description || undefined,
        description: values.description || undefined,
        banner_url: values.banner_url || null,
        start_at: fromDatetimeLocalValue(values.start_at),
        end_at: fromDatetimeLocalValue(values.end_at),
        timezone: values.timezone,
        venue_id: venueId,
        category_id: Number(values.category_ids[0]),
        category_ids: values.category_ids.map(Number),
        tag_ids: values.tag_ids?.map(Number),
        capacity: toOptionalNumber(values.capacity),
        is_free: values.is_free,
        visibility: values.visibility,
        settings,
      });

      const eventUuid = response.data.uuid;

      if (values.create_ticket) {
        await ticketApi.create(eventUuid, {
          kind: values.ticket_kind,
          name: values.ticket_name?.trim() || undefined,
          price: values.ticket_kind === "paid" ? Number(values.ticket_price) : 0,
          quantity: Number(values.ticket_quantity),
        });
      }

      router.push(
        values.create_ticket
          ? routes.organizerEventTickets(eventUuid)
          : routes.organizerEventTicketNew(eventUuid),
      );
    } catch {
      // Toast handled by mutations / API client.
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const goNextWizardStep = async () => {
    const stepFields =
      wizardStep === 0
        ? mediaFields
        : wizardStep === 1
          ? detailFields
          : wizardStep === 2
            ? scheduleFields
            : wizardStep === 3
              ? locationFields
              : wizardStep === 4
                ? policyFields
                : ticketFields;

    const valid = await trigger(stepFields);
    if (valid) {
      setWizardStep((step) => Math.min(step + 1, wizardSteps.length - 1));
    }
  };

  const scheduleRegister = register as unknown as UseFormRegister<{
    start_at: string;
    end_at: string;
    timezone: string;
  }>;
  const scheduleErrors = errors as FieldErrors<{
    start_at: string;
    end_at: string;
    timezone: string;
  }>;

  if (isEdit && eventQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isEdit && eventQuery.isError) {
    return (
      <FormSectionCard title="Event tidak ditemukan">
        <p className="text-sm text-muted-foreground">
          Event tidak ditemukan atau Anda tidak memiliki akses.
        </p>
      </FormSectionCard>
    );
  }

  const event = eventQuery.data;

  const mediaSection = (
    <Controller
      name="banner_url"
      control={control}
      render={({ field }) => (
        <EventImageUploader
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={errors.banner_url?.message}
        />
      )}
    />
  );

  const detailsSection = (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField id="title" label="Judul" required error={errors.title?.message} className="sm:col-span-2">
        <Input id="title" className="h-11" placeholder="Tech Conference 2026" {...register("title")} />
      </FormField>
      <FormField id="slug" label="Slug" helpText="Opsional. Kosongkan untuk auto-generate." error={errors.slug?.message}>
        <Input id="slug" className="h-11" placeholder="tech-conference-2026" {...register("slug")} />
      </FormField>
      <FormField id="visibility" label="Visibilitas">
        <Select id="visibility" className="h-11" {...register("visibility")}>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
        </Select>
      </FormField>
      <FormField id="short_description" label="Deskripsi singkat" className="sm:col-span-2" error={errors.short_description?.message}>
        <Input id="short_description" className="h-11" placeholder="Ringkasan untuk listing" {...register("short_description")} />
      </FormField>
      <FormField id="description" label="Deskripsi lengkap" className="sm:col-span-2">
        <Textarea id="description" rows={6} placeholder="Detail event..." {...register("description")} />
      </FormField>
    </div>
  );

  const locationSection = (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField id="event_format" label="Format event" className="sm:col-span-2">
        <Select id="event_format" className="h-11" {...register("event_format")}>
          <option value="offline">Offline (di lokasi fisik)</option>
          <option value="online">Online (streaming / virtual)</option>
        </Select>
      </FormField>
      {eventFormat === "online" ? (
        <FormField
          id="online_url"
          label="Link streaming"
          helpText="Diisi jika belum punya venue online. Kami buatkan venue otomatis."
          error={errors.online_url?.message}
          className="sm:col-span-2"
        >
          <Input
            id="online_url"
            type="url"
            className="h-11"
            placeholder="https://zoom.us/j/..."
            {...register("online_url")}
          />
        </FormField>
      ) : null}
      <FormField id="category_ids" label="Kategori & tag" className="sm:col-span-2" error={errors.category_ids?.message}>
        <EventTaxonomyFields
          categories={categoriesQuery.data ?? []}
          selectedCategoryIds={categoryIds}
          selectedTagIds={tagIds}
          onCategoryChange={(ids) => setValue("category_ids", ids, { shouldValidate: true, shouldDirty: true })}
          onTagChange={(ids) => setValue("tag_ids", ids, { shouldDirty: true })}
          categoryError={errors.category_ids?.message}
        />
      </FormField>
      <FormField id="venue_id" label="Venue" required={eventFormat === "offline"} error={errors.venue_id?.message}>
        <Select id="venue_id" className="h-11" {...register("venue_id")} disabled={venuesQuery.isLoading}>
          <option value="">{eventFormat === "online" ? "Opsional — atau isi link di atas" : "Pilih venue"}</option>
          {(venuesQuery.data ?? []).map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
              {venue.city ? ` — ${venue.city}` : ""}
              {venue.type !== "physical" ? ` (${venue.type})` : ""}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="sm:col-span-2">
        <VenueQuickAdd
          defaultType={eventFormat === "online" ? "online" : "physical"}
          onCreated={(venueId) => setValue("venue_id", String(venueId), { shouldValidate: true, shouldDirty: true })}
        />
      </div>
      <FormField id="capacity" label="Kapasitas" helpText="Kosongkan untuk tidak terbatas.">
        <Input id="capacity" type="number" min={1} className="h-11" placeholder="Unlimited" {...register("capacity")} />
      </FormField>
      <div className="flex items-end pb-1">
        <Controller
          name="is_free"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              Event gratis
            </label>
          )}
        />
      </div>
    </div>
  );

  const policySection = (
    <div className="grid gap-5">
      <FormField id="terms" label="Syarat & ketentuan" helpText="Ditampilkan ke peserta saat checkout.">
        <Textarea
          id="terms"
          rows={6}
          placeholder="Contoh: Tiket tidak dapat dikembalikan. Wajib membawa KTP..."
          {...register("terms")}
        />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="contact_name" label="Nama PIC event" required error={errors.contact_name?.message}>
          <Input id="contact_name" className="h-11" placeholder="Nama penanggung jawab" {...register("contact_name")} />
        </FormField>
        <FormField id="contact_email" label="Email PIC" required error={errors.contact_email?.message}>
          <Input id="contact_email" type="email" className="h-11" placeholder="pic@example.com" {...register("contact_email")} />
        </FormField>
        <FormField id="contact_phone" label="Telepon PIC" className="sm:col-span-2">
          <Input id="contact_phone" className="h-11" placeholder="08xxxxxxxxxx" {...register("contact_phone")} />
        </FormField>
      </div>
    </div>
  );

  const ticketSection = (
    <div className="space-y-5">
      <Controller
        name="create_ticket"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
            Buat tipe tiket pertama sekarang
          </label>
        )}
      />
      {createTicket ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="ticket_name" label="Nama tiket" required error={errors.ticket_name?.message}>
            <Input id="ticket_name" className="h-11" placeholder="Reguler" {...register("ticket_name")} />
          </FormField>
          <FormField id="ticket_kind" label="Jenis">
            <Select id="ticket_kind" className="h-11" {...register("ticket_kind")} disabled={isFree}>
              <option value="free">Gratis</option>
              <option value="paid">Berbayar</option>
            </Select>
          </FormField>
          {ticketKind === "paid" && !isFree ? (
            <FormField id="ticket_price" label="Harga (IDR)" required error={errors.ticket_price?.message}>
              <Input id="ticket_price" type="number" min={1} className="h-11" {...register("ticket_price")} />
            </FormField>
          ) : null}
          <FormField id="ticket_quantity" label="Kuota" required error={errors.ticket_quantity?.message}>
            <Input id="ticket_quantity" type="number" min={1} className="h-11" {...register("ticket_quantity")} />
          </FormField>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Anda bisa menambah tiket nanti dari halaman kelola tiket setelah event dibuat.
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={routes.organizerEvents}>
            <ArrowLeft className="size-4" />
            Kembali ke event
          </Link>
        </Button>
        {isEdit ? (
          <FormSaveIndicator isDirty={isDirty} isSaving={isPending} lastSaved={justSaved && !isDirty} />
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {isEdit ? "Edit event" : "Buat event baru"}
          </h1>
          {event ? <EventStatusBadge status={event.status} /> : null}
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {isEdit
            ? "Perbarui detail event. Event yang sudah dipublikasi tetap bisa diedit."
            : showOnboarding
              ? "Langkah 2: lengkapi banner, detail, lokasi, ketentuan, dan tiket pertama."
              : "Ikuti langkah-langkah untuk menyimpan event sebagai draft."}
        </p>
      </div>

      {showOnboarding ? <EventOnboardingBanner /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!isEdit ? (
          <>
            <FormWizardProgress steps={wizardSteps} currentStep={wizardStep} />
            {wizardStep === 0 ? (
              <FormSectionCard title="Banner event" description="Gambar utama di halaman publik. Bisa diunggah atau via URL.">
                {mediaSection}
              </FormSectionCard>
            ) : null}
            {wizardStep === 1 ? (
              <FormSectionCard title="Detail event" description="Informasi dasar yang ditampilkan ke peserta.">
                {detailsSection}
              </FormSectionCard>
            ) : null}
            {wizardStep === 2 ? (
              <FormSectionCard title="Jadwal" description="Tentukan kapan event berlangsung.">
                <EventScheduleEditor register={scheduleRegister} errors={scheduleErrors} startValue={startAt} endValue={endAt} />
              </FormSectionCard>
            ) : null}
            {wizardStep === 3 ? (
              <FormSectionCard title="Lokasi & kategori" description="Format offline/online, venue, dan kapasitas.">
                {locationSection}
              </FormSectionCard>
            ) : null}
            {wizardStep === 4 ? (
              <FormSectionCard title="Syarat & kontak PIC" description="Ketentuan event dan penanggung jawab.">
                {policySection}
              </FormSectionCard>
            ) : null}
            {wizardStep === 5 ? (
              <FormSectionCard title="Tiket pertama" description="Opsional — siapkan minimal satu tipe tiket.">
                {ticketSection}
              </FormSectionCard>
            ) : null}
            <div className="flex flex-wrap justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={wizardStep === 0}
                onClick={() => setWizardStep((step) => Math.max(step - 1, 0))}
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href={routes.organizerEvents}>Batal</Link>
                </Button>
                {wizardStep < wizardSteps.length - 1 ? (
                  <Button type="button" onClick={goNextWizardStep} className="bg-brand hover:bg-brand-hover">
                    Lanjut
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending} className="bg-brand hover:bg-brand-hover">
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Buat draft"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-6">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
                <FormTabButton active={editTab === "media"} onClick={() => setEditTab("media")}>
                  Banner
                </FormTabButton>
                <FormTabButton active={editTab === "details"} onClick={() => setEditTab("details")}>
                  Detail
                </FormTabButton>
                <FormTabButton active={editTab === "schedule"} onClick={() => setEditTab("schedule")}>
                  Jadwal
                </FormTabButton>
                <FormTabButton active={editTab === "location"} onClick={() => setEditTab("location")}>
                  Lokasi
                </FormTabButton>
                <FormTabButton active={editTab === "policy"} onClick={() => setEditTab("policy")}>
                  Ketentuan
                </FormTabButton>
              </div>

              {editTab === "media" ? (
                <FormSectionCard title="Banner event" description="Gambar utama untuk halaman publik event.">
                  {mediaSection}
                </FormSectionCard>
              ) : null}
              {editTab === "details" ? (
                <FormSectionCard title="Detail event">{detailsSection}</FormSectionCard>
              ) : null}
              {editTab === "schedule" ? (
                <FormSectionCard title="Jadwal">
                  <EventScheduleEditor register={scheduleRegister} errors={scheduleErrors} startValue={startAt} endValue={endAt} />
                </FormSectionCard>
              ) : null}
              {editTab === "location" ? (
                <FormSectionCard title="Lokasi & kategori">{locationSection}</FormSectionCard>
              ) : null}
              {editTab === "policy" ? (
                <FormSectionCard title="Syarat & kontak PIC">{policySection}</FormSectionCard>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href={routes.organizerEvents}>Batal</Link>
                </Button>
                <Button type="submit" disabled={isPending} className="bg-brand hover:bg-brand-hover">
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan perubahan"
                  )}
                </Button>
              </div>
            </div>

            {event ? (
              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <FormSectionCard title="Publikasi" description="Kelola status event.">
                  <EventActions event={event} layout="stack" variant="premium" hideNavLinks />
                </FormSectionCard>
                <FormSectionCard title="Tiket">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={routes.organizerEventTickets(event.uuid)}>Kelola tiket</Link>
                  </Button>
                </FormSectionCard>
              </aside>
            ) : null}
          </div>
        )}
      </form>
    </div>
  );
}

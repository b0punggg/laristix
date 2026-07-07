"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  useEventCategoriesQuery,
  useEventQuery,
  useEventVenuesQuery,
  useUpdateEventMutation,
} from "@/hooks/use-events";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { Event } from "@/types/event";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { EventActions } from "./event-actions";
import { EventStatusBadge } from "./event-status-badge";
import { VenueQuickAdd } from "./venue-quick-add";

const baseSchema = z
  .object({
    title: z.string().min(1, "Title is required.").max(255),
    slug: z.string().max(255).optional(),
    short_description: z.string().max(500).optional(),
    description: z.string().optional(),
    banner_url: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
    start_at: z.string().min(1, "Start time is required."),
    end_at: z.string().min(1, "End time is required."),
    timezone: z.string().min(1, "Timezone is required."),
    venue_id: z.string().min(1, "Venue wajib dipilih."),
    category_id: z.string().min(1, "Kategori wajib dipilih."),
    capacity: z.string().optional(),
    is_free: z.boolean(),
    visibility: z.enum(["public", "private", "unlisted"]),
  })
  .refine((data) => new Date(data.end_at) > new Date(data.start_at), {
    message: "End time must be after start time.",
    path: ["end_at"],
  });

type EventFormValues = z.infer<typeof baseSchema>;

const wizardSteps: FormWizardStep[] = [
  { id: "details", label: "Detail", description: "Judul & deskripsi" },
  { id: "schedule", label: "Jadwal", description: "Waktu event" },
  { id: "location", label: "Lokasi", description: "Venue & kategori" },
];

const detailFields: (keyof EventFormValues)[] = [
  "title",
  "slug",
  "short_description",
  "description",
  "visibility",
];
const scheduleFields: (keyof EventFormValues)[] = ["start_at", "end_at", "timezone"];
const locationFields: (keyof EventFormValues)[] = ["venue_id", "category_id", "capacity"];

type EditTab = "details" | "schedule" | "location" | "media";

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
  return {
    title: event.title,
    slug: event.slug,
    short_description: event.short_description ?? "",
    description: event.description ?? "",
    banner_url: event.banner_url ?? "",
    start_at: toDatetimeLocalValue(event.start_at),
    end_at: toDatetimeLocalValue(event.end_at),
    timezone: event.timezone,
    venue_id: event.venue?.id ? String(event.venue.id) : "",
    category_id: event.category?.id ? String(event.category.id) : "",
    capacity: event.capacity ? String(event.capacity) : "",
    is_free: event.is_free,
    visibility: event.visibility,
  };
}

interface EventFormProps {
  mode: "create" | "edit";
  uuid?: string;
}

export function EventForm({ mode, uuid }: EventFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = mode === "edit" && uuid;
  const eventQuery = useEventQuery(uuid ?? "", Boolean(isEdit));
  const venuesQuery = useEventVenuesQuery();
  const categoriesQuery = useEventCategoriesQuery();
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation(uuid ?? "");

  const [wizardStep, setWizardStep] = useState(0);
  const [editTab, setEditTab] = useState<EditTab>("details");
  const [justSaved, setJustSaved] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      title: "",
      slug: "",
      short_description: "",
      description: "",
      banner_url: "",
      start_at: "",
      end_at: "",
      timezone: "Asia/Jakarta",
      venue_id: "",
      category_id: "",
      capacity: "",
      is_free: false,
      visibility: "public",
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

  const onSubmit = (values: EventFormValues) => {
    const payload = {
      title: values.title,
      slug: values.slug || undefined,
      short_description: values.short_description || undefined,
      description: values.description || undefined,
      start_at: fromDatetimeLocalValue(values.start_at),
      end_at: fromDatetimeLocalValue(values.end_at),
      timezone: values.timezone,
      venue_id: toOptionalId(values.venue_id) as number,
      category_id: toOptionalId(values.category_id) as number,
      capacity: toOptionalNumber(values.capacity),
      is_free: values.is_free,
      visibility: values.visibility,
    };

    if (isEdit) {
      updateMutation.mutate({ ...payload, banner_url: values.banner_url || null });
      return;
    }

    createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const goNextWizardStep = async () => {
    const fields =
      wizardStep === 0 ? detailFields : wizardStep === 1 ? scheduleFields : locationFields;
    const valid = await trigger(fields);
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
      <FormField id="category_id" label="Kategori" required error={errors.category_id?.message}>
        <Select id="category_id" className="h-11" {...register("category_id")} disabled={categoriesQuery.isLoading}>
          <option value="">Pilih kategori</option>
          {(categoriesQuery.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="venue_id" label="Venue" required error={errors.venue_id?.message}>
        <Select id="venue_id" className="h-11" {...register("venue_id")} disabled={venuesQuery.isLoading}>
          <option value="">Pilih venue</option>
          {(venuesQuery.data ?? []).map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
              {venue.city ? ` — ${venue.city}` : ""}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="sm:col-span-2">
        <VenueQuickAdd onCreated={(venueId) => setValue("venue_id", String(venueId), { shouldValidate: true, shouldDirty: true })} />
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
            : "Ikuti langkah-langkah untuk menyimpan event sebagai draft."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!isEdit ? (
          <>
            <FormWizardProgress steps={wizardSteps} currentStep={wizardStep} />
            {wizardStep === 0 ? (
              <FormSectionCard title="Detail event" description="Informasi dasar yang ditampilkan ke peserta.">
                {detailsSection}
              </FormSectionCard>
            ) : null}
            {wizardStep === 1 ? (
              <FormSectionCard title="Jadwal" description="Tentukan kapan event berlangsung.">
                <EventScheduleEditor register={scheduleRegister} errors={scheduleErrors} startValue={startAt} endValue={endAt} />
              </FormSectionCard>
            ) : null}
            {wizardStep === 2 ? (
              <FormSectionCard title="Lokasi & kategori" description="Venue dan pengaturan kapasitas.">
                {locationSection}
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
                <FormTabButton active={editTab === "details"} onClick={() => setEditTab("details")}>
                  Detail
                </FormTabButton>
                <FormTabButton active={editTab === "schedule"} onClick={() => setEditTab("schedule")}>
                  Jadwal
                </FormTabButton>
                <FormTabButton active={editTab === "location"} onClick={() => setEditTab("location")}>
                  Lokasi
                </FormTabButton>
                <FormTabButton active={editTab === "media"} onClick={() => setEditTab("media")}>
                  Media
                </FormTabButton>
              </div>

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
              {editTab === "media" ? (
                <FormSectionCard title="Banner event" description="Gambar utama untuk halaman publik event.">
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
                </FormSectionCard>
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

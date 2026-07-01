"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { EventActions } from "./event-actions";
import { EventStatusBadge } from "./event-status-badge";
import { VenueQuickAdd } from "./venue-quick-add";

const timezones = [
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Bangkok",
  "Asia/Makassar",
  "Asia/Jayapura",
  "UTC",
];

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

function toOptionalNumber(value: string | undefined): number | null | undefined {
  if (value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
}

function toOptionalId(value: string | undefined): number | null | undefined {
  if (value === undefined || value === "") {
    return null;
  }

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
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
      updateMutation.mutate({
        ...payload,
        banner_url: values.banner_url || null,
      });
      return;
    }

    createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && eventQuery.isLoading) {
    return <p className="text-muted-foreground">Loading event...</p>;
  }

  if (isEdit && eventQuery.isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Event not found or you do not have access.
        </CardContent>
      </Card>
    );
  }

  const event = eventQuery.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.organizerEvents}>
            <ArrowLeft className="size-4" />
            Back to events
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit event" : "Create event"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Update event details. Published events can still be edited."
              : "New events are saved as drafts until you publish them."}
          </p>
        </div>
        {event ? (
          <div className="flex items-center gap-3">
            <EventStatusBadge status={event.status} />
          </div>
        ) : null}
      </div>

      {event ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <EventActions event={event} layout="stack" />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-lg">Event details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} placeholder="Tech Conference 2026" />
                {errors.title ? (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input id="slug" {...register("slug")} placeholder="tech-conference-2026" />
                {errors.slug ? (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select id="visibility" {...register("visibility")}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="short_description">Short description</Label>
                <Input
                  id="short_description"
                  {...register("short_description")}
                  placeholder="One-line summary for listings"
                />
                {errors.short_description ? (
                  <p className="text-sm text-destructive">{errors.short_description.message}</p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  {...register("description")}
                  placeholder="Full event description..."
                />
              </div>

              {isEdit ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="banner_url">Banner URL</Label>
                  <Input
                    id="banner_url"
                    type="url"
                    {...register("banner_url")}
                    placeholder="https://..."
                  />
                  {errors.banner_url ? (
                    <p className="text-sm text-destructive">{errors.banner_url.message}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-sm font-medium">Schedule</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_at">Start *</Label>
                  <Input id="start_at" type="datetime-local" {...register("start_at")} />
                  {errors.start_at ? (
                    <p className="text-sm text-destructive">{errors.start_at.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_at">End *</Label>
                  <Input id="end_at" type="datetime-local" {...register("end_at")} />
                  {errors.end_at ? (
                    <p className="text-sm text-destructive">{errors.end_at.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select id="timezone" {...register("timezone")}>
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-sm font-medium">Location & category</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select
                    id="category_id"
                    {...register("category_id")}
                    disabled={categoriesQuery.isLoading}
                  >
                    <option value="">Pilih kategori</option>
                    {(categoriesQuery.data ?? []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  {errors.category_id ? (
                    <p className="text-sm text-destructive">{errors.category_id.message}</p>
                  ) : null}
                  {!categoriesQuery.isLoading && (categoriesQuery.data ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Belum ada kategori. Jalankan <code>php artisan db:seed</code> untuk kategori default.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_id">Venue *</Label>
                  <Select id="venue_id" {...register("venue_id")} disabled={venuesQuery.isLoading}>
                    <option value="">Pilih venue</option>
                    {(venuesQuery.data ?? []).map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                        {venue.city ? ` — ${venue.city}` : ""}
                      </option>
                    ))}
                  </Select>
                  {errors.venue_id ? (
                    <p className="text-sm text-destructive">{errors.venue_id.message}</p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <VenueQuickAdd
                    onCreated={(venueId) => {
                      setValue("venue_id", String(venueId), { shouldValidate: true });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    {...register("capacity")}
                    placeholder="Unlimited"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 rounded border" {...register("is_free")} />
                    Free event
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={routes.organizerEvents}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create draft"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

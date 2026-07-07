"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Plus, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/env";
import { useEventsQuery } from "@/hooks/use-events";
import { formatEventDateRange } from "@/lib/datetime";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { EventListFilters, EventStatus } from "@/types/event";
import { EventActions } from "./event-actions";
import { EventStatusBadge } from "./event-status-badge";
import { FormSectionCard, FormTabButton } from "./event-management-ui";
import { cn } from "@/lib/utils";

const statusTabs: Array<{ label: string; value?: EventStatus }> = [
  { label: "Semua", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Dipublikasi", value: "published" },
  { label: "Live", value: "live" },
  { label: "Selesai", value: "completed" },
];

function EventListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Skeleton className="aspect-[21/9] w-full rounded-xl sm:aspect-video sm:w-48" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EventListPanel() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventStatus | undefined>(undefined);

  const filters = useMemo<EventListFilters>(
    () => ({
      status,
      search: search.trim() || undefined,
    }),
    [status, search],
  );

  const { data, isLoading, isError, refetch } = useEventsQuery(filters);
  const events = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Event</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Buat, publikasikan, dan kelola event untuk organizer Anda.
          </p>
        </div>
        {canManageEvents(user) ? (
          <Button asChild className="bg-brand hover:bg-brand-hover">
            <Link href={routes.organizerEventNew}>
              <Plus className="size-4" />
              Buat event
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
          {statusTabs.map((tab) => (
            <FormTabButton
              key={tab.label}
              active={status === tab.value}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </FormTabButton>
          ))}
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="h-11 pl-9"
            placeholder="Cari event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? <EventListSkeleton /> : null}

      {isError ? (
        <FormSectionCard title="Gagal memuat event">
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">Terjadi kesalahan saat memuat daftar event.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        </FormSectionCard>
      ) : null}

      {!isLoading && !isError && events.length === 0 ? (
        <FormSectionCard title="Belum ada event">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
              <Calendar className="size-7" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Mulai dengan event pertama Anda</p>
              <p className="text-sm text-muted-foreground">
                {canManageEvents(user)
                  ? "Buat draft event, atur jadwal, lalu publikasikan saat siap."
                  : "Organizer Anda belum membuat event."}
              </p>
            </div>
            {canManageEvents(user) ? (
              <Button asChild className="bg-brand hover:bg-brand-hover">
                <Link href={routes.organizerEventNew}>Buat event</Link>
              </Button>
            ) : null}
          </div>
        </FormSectionCard>
      ) : null}

      {!isLoading && !isError && events.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{total} event</p>
          <div className="grid gap-4">
            {events.map((event) => (
              <article
                key={event.uuid}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  <div
                    className={cn(
                      "relative shrink-0 bg-muted/40 sm:w-52",
                      event.banner_url ? "aspect-[21/9] sm:aspect-auto sm:min-h-[140px]" : "hidden sm:block sm:w-40",
                    )}
                  >
                    {event.banner_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.banner_url}
                        alt=""
                        className="h-full w-full object-cover sm:absolute sm:inset-0"
                      />
                    ) : (
                      <div className="flex h-full min-h-[120px] items-center justify-center text-muted-foreground">
                        <Calendar className="size-8 opacity-40" aria-hidden />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={routes.organizerEventEdit(event.uuid)}
                          className="ds-focus-ring block truncate text-lg font-semibold text-foreground hover:text-brand"
                        >
                          {event.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {formatEventDateRange(event.start_at, event.end_at, event.timezone)}
                        </p>
                      </div>
                      <EventStatusBadge status={event.status} />
                    </div>

                    {event.short_description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{event.short_description}</p>
                    ) : null}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-mono">/{event.slug}</span>
                      {event.venue?.name ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" aria-hidden />
                          {event.venue.name}
                        </span>
                      ) : null}
                      {event.category?.name ? (
                        <span className="inline-flex items-center gap-1">
                          <Tag className="size-3" aria-hidden />
                          {event.category.name}
                        </span>
                      ) : null}
                      <span className="capitalize">{event.visibility}</span>
                      <span>{event.is_free ? "Gratis" : "Berbayar"}</span>
                    </div>

                    <EventActions event={event} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/env";
import { useEventsQuery } from "@/hooks/use-events";
import { formatEventDateRange } from "@/lib/datetime";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { EventListFilters, EventStatus } from "@/types/event";
import { EventActions } from "./event-actions";
import { EventStatusBadge } from "./event-status-badge";

const statusTabs: Array<{ label: string; value?: EventStatus }> = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events</h2>
          <p className="text-sm text-muted-foreground">
            Create, publish, and manage events for your organizer.
          </p>
        </div>
        {canManageEvents(user) ? (
          <Button asChild>
            <Link href={routes.organizerEventNew}>
              <Plus className="size-4" />
              New event
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.label}
              variant={status === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading events...</CardContent>
        </Card>
      ) : null}

      {isError ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-muted-foreground">Failed to load events.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && events.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <Calendar className="mx-auto size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No events yet</p>
              <p className="text-sm text-muted-foreground">
                {canManageEvents(user)
                  ? "Create your first event to get started."
                  : "Your organizer has not created any events yet."}
              </p>
            </div>
            {canManageEvents(user) ? (
              <Button asChild>
                <Link href={routes.organizerEventNew}>Create event</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && events.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{total} event(s)</p>
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.uuid}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatEventDateRange(event.start_at, event.end_at, event.timezone)}
                    </p>
                  </div>
                  <EventStatusBadge status={event.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.short_description ? (
                    <p className="text-sm text-muted-foreground">{event.short_description}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>/{event.slug}</span>
                    {event.venue?.name ? <span>Venue: {event.venue.name}</span> : null}
                    {event.category?.name ? <span>Category: {event.category.name}</span> : null}
                    <span className="capitalize">{event.visibility}</span>
                    {event.is_free ? <span>Free</span> : <span>Paid</span>}
                  </div>
                  <EventActions event={event} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Calendar, ExternalLink, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListPagination } from "@/components/common/list-pagination";
import { useAdminEventsQuery } from "@/hooks/use-events";
import { formatEventDateRange } from "@/lib/datetime";
import { routes } from "@/config/env";
import type { AdminEventListFilters, EventStatus } from "@/types/event";
import { EventStatusBadge } from "@/components/features/events/event-status-badge";

const statusTabs: Array<{ label: string; value?: EventStatus }> = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Live", value: "live" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const PER_PAGE = 15;

export function AdminEventListPanel() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  const filters = useMemo<AdminEventListFilters>(
    () => ({
      status,
      search: search.trim() || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [status, search, page],
  );

  const { data, isLoading, isError, refetch } = useAdminEventsQuery(filters);
  const events = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform events</h2>
        <p className="text-sm text-muted-foreground">
          View all events across organizers on the platform.
        </p>
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
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading events...
          </CardContent>
        </Card>
      ) : null}

      {isError ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-muted-foreground">Failed to load platform events.</p>
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
            <p className="font-medium">No events found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting filters or check back when organizers create events.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && events.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{total} event(s) platform-wide</p>
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.uuid}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatEventDateRange(event.start_at, event.end_at, event.timezone)}
                    </p>
                    {event.organizer ? (
                      <p className="text-sm font-medium text-primary">{event.organizer.name}</p>
                    ) : null}
                  </div>
                  <EventStatusBadge status={event.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>/{event.slug}</span>
                    {event.organizer?.slug ? <span>@{event.organizer.slug}</span> : null}
                    <span className="capitalize">{event.visibility}</span>
                    {event.is_free ? <span>Free</span> : <span>Paid</span>}
                    {event.published_at ? (
                      <span>
                        Published{" "}
                        {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
                          new Date(event.published_at),
                        )}
                      </span>
                    ) : null}
                  </div>
                  {event.visibility === "public" && event.status !== "draft" ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={routes.publicEvent(event.uuid)} target="_blank">
                        <ExternalLink className="mr-2 size-4" />
                        View public page
                      </Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
          {meta ? <ListPagination meta={meta} onPageChange={setPage} /> : null}
        </div>
      ) : null}
    </div>
  );
}

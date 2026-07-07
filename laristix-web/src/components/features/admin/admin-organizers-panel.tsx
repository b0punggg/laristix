"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Building2, Eye, Search, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPagination } from "@/components/common/list-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { AdminOrganizerActions } from "@/components/features/admin/admin-organizer-actions";
import { OrganizerStatusBadge } from "@/components/features/admin/organizer-status-badge";
import { FormTabButton } from "@/components/features/events/event-management-ui";
import { useAdminOrganizersQuery } from "@/hooks/use-admin-organizers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDateId } from "@/lib/format";
import { routes } from "@/config/env";
import type { AdminOrganizerListFilters, OrganizerStatus } from "@/types/organizer";

const statusTabs: Array<{ label: string; value?: OrganizerStatus }> = [
  { label: "All", value: undefined },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Archived", value: "archived" },
];

const PER_PAGE = 15;

function OrganizerCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  );
}

export function AdminOrganizersPanel() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<OrganizerStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const filters = useMemo<AdminOrganizerListFilters>(
    () => ({
      status,
      search: debouncedSearch.trim() || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [status, debouncedSearch, page],
  );

  const { data, isLoading, isError, refetch } = useAdminOrganizersQuery(filters);
  const organizers = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Organizer Approval</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Review pending organizers, approve trusted partners, and manage lifecycle status
              from a modern admin surface.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
              <p className="text-xs text-muted-foreground">Visible rows</p>
              <p className="mt-1 text-2xl font-bold">{organizers.length}</p>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
              <p className="text-xs text-muted-foreground">Total organizers</p>
              <p className="mt-1 text-2xl font-bold">{total}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, slug, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <OrganizerCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {isError ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Building2}
              title="Failed to load organizers"
              description="We could not fetch the organizer list."
            >
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </EmptyState>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && organizers.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Building2}
              title="No organizers found"
              description="Try adjusting filters or check back later."
            />
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && organizers.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{total} organizer(s)</p>
          <div className="grid gap-4">
            {organizers.map((organizer) => (
              <Card key={organizer.uuid} className="rounded-3xl border-border/80 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{organizer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{organizer.email}</p>
                    <p className="text-sm text-muted-foreground">@{organizer.slug}</p>
                    {organizer.owner ? (
                      <p className="text-sm">
                        Owner:{" "}
                        <span className="font-medium">{organizer.owner.name}</span> (
                        {organizer.owner.email})
                      </p>
                    ) : null}
                  </div>
                  <OrganizerStatusBadge status={organizer.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{organizer.events_count ?? 0} event(s)</span>
                    <span>{organizer.country_code}</span>
                    <span>{organizer.currency}</span>
                    {organizer.created_at ? (
                      <span>Registered {formatDateId(organizer.created_at)}</span>
                    ) : null}
                    {organizer.approved_at ? (
                      <span>Approved {formatDateId(organizer.approved_at)}</span>
                    ) : null}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Approval</p>
                      <p className="mt-1 font-medium">
                        {organizer.status === "pending" ? "Needs review" : "Reviewed"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="mt-1 font-medium">{organizer.owner?.name ?? "—"}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="mt-1 font-medium">
                        {organizer.country_code} · {organizer.currency}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Risk signal</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 font-medium">
                        {organizer.status === "pending" ? (
                          <>
                            <ShieldAlert className="size-4 text-amber-500" />
                            Review required
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="size-4 text-emerald-500" />
                            Healthy
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <AdminOrganizerActions organizer={organizer} />
                    <Button asChild variant="ghost" size="sm">
                      <Link href={routes.adminOrganizerDetail(organizer.uuid)}>
                        <Eye className="mr-2 size-4" />
                        View details
                      </Link>
                    </Button>
                  </div>
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

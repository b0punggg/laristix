"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminOrganizerActions } from "@/components/features/admin/admin-organizer-actions";
import { AdminOrganizerFeePanel } from "@/components/features/admin/admin-organizer-fee-panel";
import { OrganizerStatusBadge } from "@/components/features/admin/organizer-status-badge";
import { useAdminOrganizerQuery } from "@/hooks/use-admin-organizers";
import { routes } from "@/config/env";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface AdminOrganizerDetailPanelProps {
  uuid: string;
}

export function AdminOrganizerDetailPanel({ uuid }: AdminOrganizerDetailPanelProps) {
  const { data: organizer, isLoading, isError, refetch } = useAdminOrganizerQuery(uuid);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading organizer details...
        </CardContent>
      </Card>
    );
  }

  if (isError || !organizer) {
    return (
      <Card>
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-muted-foreground">Failed to load organizer details.</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
            <Button asChild variant="ghost">
              <Link href={routes.adminOrganizers}>Back to list</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href={routes.adminOrganizers}>
              <ArrowLeft className="mr-2 size-4" />
              Back to organizers
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{organizer.name}</h2>
            <OrganizerStatusBadge status={organizer.status} />
          </div>
          <p className="text-sm text-muted-foreground">@{organizer.slug}</p>
        </div>
        <AdminOrganizerActions organizer={organizer} size="default" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact & profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {organizer.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span> {organizer.phone ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Website:</span>{" "}
              {organizer.website ? (
                <a
                  href={organizer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {organizer.website}
                </a>
              ) : (
                "—"
              )}
            </p>
            <p>
              <span className="text-muted-foreground">Description:</span>{" "}
              {organizer.description ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Events:</span>{" "}
              {organizer.events_count ?? 0}
            </p>
            <p>
              <span className="text-muted-foreground">Country:</span> {organizer.country_code}
            </p>
            <p>
              <span className="text-muted-foreground">Currency:</span> {organizer.currency}
            </p>
            <p>
              <span className="text-muted-foreground">Timezone:</span> {organizer.timezone}
            </p>
            <p>
              <span className="text-muted-foreground">Registered:</span>{" "}
              {formatDate(organizer.created_at)}
            </p>
            <p>
              <span className="text-muted-foreground">Approved:</span>{" "}
              {formatDate(organizer.approved_at)}
            </p>
            {organizer.approved_by ? (
              <p>
                <span className="text-muted-foreground">Approved by:</span>{" "}
                {organizer.approved_by.name} ({organizer.approved_by.email})
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Building2 className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Owner</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {organizer.owner ? (
              <p>
                {organizer.owner.name} — {organizer.owner.email}
              </p>
            ) : (
              <p className="text-muted-foreground">No active owner membership found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminOrganizerFeePanel organizerUuid={uuid} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/env";
import { useOrganizersQuery, useSwitchOrganizerMutation } from "@/hooks/use-auth";

export function OrganizerPicker() {
  const { data: organizers, isLoading, isError } = useOrganizersQuery();
  const switchOrganizer = useSwitchOrganizerMutation();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading organizers...</p>;
  }

  if (isError || !organizers?.length) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <p className="text-sm text-muted-foreground">No organizers found for your account.</p>
          <Button asChild className="w-full">
            <Link href={routes.createOrganizer}>Create organizer</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {organizers.map((organizer) => (
        <Card key={organizer.id}>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-medium">{organizer.name}</p>
              <p className="text-sm text-muted-foreground">
                {organizer.membership?.role ?? "member"} · {organizer.slug}
                {organizer.status === "pending" ? " · pending approval" : ""}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => switchOrganizer.mutate(organizer.id)}
              disabled={switchOrganizer.isPending}
            >
              Select
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" className="w-full" asChild>
        <Link href={routes.createOrganizer}>Create another organizer</Link>
      </Button>
    </div>
  );
}

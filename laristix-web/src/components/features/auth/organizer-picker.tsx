"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrganizerInvitationsList } from "@/components/features/organizer/organizer-invitations-list";
import { organizerMemberRoleLabel } from "@/lib/organizer-member-labels";
import { routes } from "@/config/env";
import { useOrganizersQuery, useSwitchOrganizerMutation } from "@/hooks/use-auth";

export function OrganizerPicker() {
  const { data: organizers, isLoading, isError } = useOrganizersQuery();
  const switchOrganizer = useSwitchOrganizerMutation();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat organizer...</p>;
  }

  const hasOrganizers = (organizers?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <OrganizerInvitationsList />

      {!hasOrganizers ? (
        isError ? (
          <Card>
            <CardContent className="space-y-4 pt-6 text-center">
              <p className="text-sm text-muted-foreground">Gagal memuat daftar organizer.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada organizer aktif. Terima undangan di atas atau buat organizer baru.
              </p>
              <Button asChild className="w-full">
                <Link href={routes.createOrganizer}>Buat organizer</Link>
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium">Organizer Anda</p>
          {organizers?.map((organizer) => (
            <Card key={organizer.id}>
              <CardContent className="flex items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-medium">{organizer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {organizer.membership?.role
                      ? organizerMemberRoleLabel(
                          organizer.membership.role as "owner" | "admin" | "staff" | "scanner",
                        )
                      : "anggota"}{" "}
                    · {organizer.slug}
                    {organizer.status === "pending" ? " · menunggu persetujuan" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => switchOrganizer.mutate(organizer.id)}
                  disabled={switchOrganizer.isPending}
                >
                  Pilih
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" className="w-full" asChild>
            <Link href={routes.createOrganizer}>Buat organizer lain</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

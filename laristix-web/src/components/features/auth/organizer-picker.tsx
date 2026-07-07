"use client";

import Link from "next/link";
import { Building2, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthLoadingState } from "@/components/features/auth/auth-ui";
import { OrganizerInvitationsList } from "@/components/features/organizer/organizer-invitations-list";
import { organizerMemberRoleLabel } from "@/lib/organizer-member-labels";
import { routes } from "@/config/env";
import { useOrganizersQuery, useSwitchOrganizerMutation } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function OrganizerPicker() {
  const { data: organizers, isLoading, isError } = useOrganizersQuery();
  const switchOrganizer = useSwitchOrganizerMutation();

  if (isLoading) {
    return <AuthLoadingState message="Memuat organizer..." />;
  }

  const hasOrganizers = (organizers?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <OrganizerInvitationsList />

      {!hasOrganizers ? (
        isError ? (
          <Card className="border-dashed">
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">Gagal memuat daftar organizer.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="space-y-5 py-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                <Building2 className="size-7" aria-hidden />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Belum ada organizer aktif</p>
                <p className="text-sm text-muted-foreground">
                  Terima undangan di atas atau buat organizer baru untuk mulai mengelola event.
                </p>
              </div>
              <Button asChild className="w-full bg-brand hover:bg-brand-hover" size="lg">
                <Link href={routes.createOrganizer}>
                  <Plus className="size-4" aria-hidden />
                  Buat organizer
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Organizer Anda</p>
          <div className="space-y-3">
            {organizers?.map((organizer) => (
              <Card
                key={organizer.id}
                className={cn(
                  "overflow-hidden transition-all hover:border-brand/30 hover:shadow-md",
                  switchOrganizer.isPending && "opacity-80",
                )}
              >
                <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
                      <Building2 className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{organizer.name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {organizer.membership?.role
                          ? organizerMemberRoleLabel(
                              organizer.membership.role as
                                | "owner"
                                | "admin"
                                | "staff"
                                | "scanner",
                            )
                          : "anggota"}{" "}
                        · {organizer.slug}
                      </p>
                      {organizer.status === "pending" ? (
                        <Badge variant="warning" className="mt-2">
                          Menunggu persetujuan
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 bg-brand hover:bg-brand-hover"
                    onClick={() => switchOrganizer.mutate(organizer.id)}
                    disabled={switchOrganizer.isPending}
                  >
                    Pilih
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="w-full" size="lg" asChild>
            <Link href={routes.createOrganizer}>
              <Plus className="size-4" aria-hidden />
              Buat organizer lain
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

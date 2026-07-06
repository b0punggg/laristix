"use client";

import Link from "next/link";
import { CalendarPlus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { routes } from "@/config/env";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export function OrganizerEmptyOnboarding() {
  const user = useAuthStore((s) => s.user);
  const canCreate = canManageEvents(user);

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <EmptyState
          icon={CalendarPlus}
          title="Belum ada event"
          description="Mulai dengan membuat event pertama untuk menjual tiket dan mengelola peserta."
        >
          {canCreate ? (
            <Button asChild>
              <Link href={routes.organizerEventNew}>
                <Plus className="mr-2 size-4" />
                Buat event pertama
              </Link>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Hubungi owner organizer untuk membuat event.
            </p>
          )}
        </EmptyState>
      </CardContent>
    </Card>
  );
}

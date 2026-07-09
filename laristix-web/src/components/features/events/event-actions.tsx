"use client";

import Link from "next/link";
import { Archive, BarChart3, Pencil, Rocket, RotateCcw, Ticket, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import {
  useDeleteEventMutation,
  useDraftEventMutation,
  usePublishEventMutation,
} from "@/hooks/use-events";
import type { Event } from "@/types/event";
import { DeleteEventDialog } from "./delete-event-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EventActionsProps {
  event: Event;
  layout?: "row" | "stack";
  variant?: "default" | "premium";
  hideNavLinks?: boolean;
}

export function EventActions({
  event,
  layout = "row",
  variant = "default",
  hideNavLinks = false,
}: EventActionsProps) {
  const publish = usePublishEventMutation();
  const draft = useDraftEventMutation();
  const remove = useDeleteEventMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const flags = event.management;
  const isBusy = publish.isPending || draft.isPending || remove.isPending;
  const isPremiumStack = layout === "stack" && variant === "premium";
  const buttonClass = isPremiumStack ? "w-full justify-start" : undefined;

  return (
    <>
      <div className={layout === "stack" ? "flex flex-col gap-2.5" : "flex flex-wrap gap-2"}>
        {!hideNavLinks ? (
          <>
            <Button variant="outline" size="sm" asChild className={buttonClass}>
              <Link href={routes.organizerEventDashboard(event.uuid)}>
                <BarChart3 className="size-4" />
                Dashboard
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild className={buttonClass}>
              <Link href={routes.organizerEventTickets(event.uuid)}>
                <Ticket className="size-4" />
                Kelola tiket
              </Link>
            </Button>

            {event.status === "published" || event.status === "live" ? (
              <Button variant="outline" size="sm" asChild className={buttonClass}>
                <Link href={routes.organizerEventAttendance(event.uuid)}>
                  <Users className="size-4" />
                  Kehadiran
                </Link>
              </Button>
            ) : null}

            {flags?.can_edit ? (
              <Button variant="outline" size="sm" asChild className={buttonClass}>
                <Link href={routes.organizerEventEdit(event.uuid)}>
                  <Pencil className="size-4" />
                  Edit event
                </Link>
              </Button>
            ) : null}
          </>
        ) : null}

        {flags?.can_publish ? (
          <Button
            size="sm"
            onClick={() => publish.mutate(event.uuid)}
            disabled={isBusy}
            className={cn(buttonClass, isPremiumStack && "bg-brand hover:bg-brand-hover")}
          >
            <Rocket className="size-4" />
            {publish.isPending ? "Mempublikasikan..." : "Publikasikan"}
          </Button>
        ) : null}

        {flags?.can_draft ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => draft.mutate(event.uuid)}
            disabled={isBusy}
            className={buttonClass}
          >
            <RotateCcw className="size-4" />
            {draft.isPending ? "Mengembalikan..." : "Kembalikan ke draft"}
          </Button>
        ) : null}

        {event.status === "completed" || event.status === "cancelled" ? (
          <p className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <Archive className="mr-1.5 inline size-3.5 align-text-bottom" aria-hidden />
            Event ini sudah {event.status === "completed" ? "selesai" : "dibatalkan"}.
          </p>
        ) : null}

        {flags?.can_delete ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={isBusy}
            className={buttonClass}
          >
            <Trash2 className="size-4" />
            Hapus event
          </Button>
        ) : null}
      </div>

      <DeleteEventDialog
        open={deleteOpen}
        title={event.title}
        isPending={remove.isPending}
        onConfirm={() => {
          remove.mutate(event.uuid, {
            onSuccess: () => setDeleteOpen(false),
          });
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

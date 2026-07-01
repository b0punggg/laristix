"use client";

import Link from "next/link";
import { Pencil, Rocket, RotateCcw, Ticket, Trash2, Users } from "lucide-react";
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

interface EventActionsProps {
  event: Event;
  layout?: "row" | "stack";
}

export function EventActions({ event, layout = "row" }: EventActionsProps) {
  const publish = usePublishEventMutation();
  const draft = useDraftEventMutation();
  const remove = useDeleteEventMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const flags = event.management;
  const isBusy = publish.isPending || draft.isPending || remove.isPending;

  const containerClass = layout === "stack" ? "flex flex-col gap-2" : "flex flex-wrap gap-2";

  return (
    <>
      <div className={containerClass}>
        <Button variant="outline" size="sm" asChild>
          <Link href={routes.organizerEventTickets(event.uuid)}>
            <Ticket className="size-4" />
            Tickets
          </Link>
        </Button>

        {event.status === "published" ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.organizerEventAttendance(event.uuid)}>
              <Users className="size-4" />
              Kehadiran
            </Link>
          </Button>
        ) : null}

        {flags?.can_edit ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.organizerEventEdit(event.uuid)}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        ) : null}

        {flags?.can_publish ? (
          <Button
            size="sm"
            onClick={() => publish.mutate(event.uuid)}
            disabled={isBusy}
          >
            <Rocket className="size-4" />
            {publish.isPending ? "Publishing..." : "Publish"}
          </Button>
        ) : null}

        {flags?.can_draft ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => draft.mutate(event.uuid)}
            disabled={isBusy}
          >
            <RotateCcw className="size-4" />
            {draft.isPending ? "Reverting..." : "Revert to draft"}
          </Button>
        ) : null}

        {flags?.can_delete ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={isBusy}
          >
            <Trash2 className="size-4" />
            Delete
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

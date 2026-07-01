"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import { useDeleteTicketMutation } from "@/hooks/use-tickets";
import type { TicketType } from "@/types/ticket";
import { DeleteTicketDialog } from "./delete-ticket-dialog";

interface TicketActionsProps {
  eventUuid: string;
  ticket: TicketType;
}

export function TicketActions({ eventUuid, ticket }: TicketActionsProps) {
  const remove = useDeleteTicketMutation(eventUuid);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const flags = ticket.management;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {flags?.can_edit ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.organizerEventTicketEdit(eventUuid, ticket.id)}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        ) : null}

        {flags?.can_delete ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={remove.isPending}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        ) : null}
      </div>

      <DeleteTicketDialog
        open={deleteOpen}
        name={ticket.name}
        isPending={remove.isPending}
        onConfirm={() => {
          remove.mutate(ticket.id, {
            onSuccess: () => setDeleteOpen(false),
          });
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

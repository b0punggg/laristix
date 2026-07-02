"use client";

import Link from "next/link";
import { Check, Loader2, Play, X, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useActivateOrganizerMutation,
  useApproveOrganizerMutation,
  useRejectOrganizerMutation,
  useSuspendOrganizerMutation,
} from "@/hooks/use-admin-organizers";
import type { AdminOrganizer, OrganizerStatus } from "@/types/organizer";

interface AdminOrganizerActionsProps {
  organizer: Pick<AdminOrganizer, "uuid" | "status" | "name">;
  size?: "sm" | "default";
}

function confirmAction(message: string): boolean {
  return window.confirm(message);
}

export function AdminOrganizerActions({ organizer, size = "sm" }: AdminOrganizerActionsProps) {
  const approve = useApproveOrganizerMutation();
  const reject = useRejectOrganizerMutation();
  const suspend = useSuspendOrganizerMutation();
  const activate = useActivateOrganizerMutation();

  const isBusy =
    approve.isPending || reject.isPending || suspend.isPending || activate.isPending;
  const busyUuid =
    approve.variables ??
    reject.variables ??
    suspend.variables ??
    activate.variables;

  const isThisBusy = isBusy && busyUuid === organizer.uuid;

  function runAction(message: string, mutate: (uuid: string) => void) {
    if (!confirmAction(message)) {
      return;
    }

    mutate(organizer.uuid);
  }

  const actions: Partial<Record<OrganizerStatus, React.ReactNode>> = {
    pending: (
      <>
        <Button
          size={size}
          disabled={isBusy}
          onClick={() =>
            runAction(`Approve organizer "${organizer.name}"?`, approve.mutate)
          }
        >
          {isThisBusy && approve.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Check className="mr-2 size-4" />
          )}
          Approve
        </Button>
        <Button
          size={size}
          variant="outline"
          disabled={isBusy}
          onClick={() =>
            runAction(
              `Reject organizer "${organizer.name}"? This cannot be undone.`,
              reject.mutate,
            )
          }
        >
          {isThisBusy && reject.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <X className="mr-2 size-4" />
          )}
          Reject
        </Button>
      </>
    ),
    active: (
      <Button
        size={size}
        variant="outline"
        disabled={isBusy}
        onClick={() =>
          runAction(
            `Suspend organizer "${organizer.name}"? They will not be able to operate until reactivated.`,
            suspend.mutate,
          )
        }
      >
        {isThisBusy && suspend.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Ban className="mr-2 size-4" />
        )}
        Suspend
      </Button>
    ),
    suspended: (
      <Button
        size={size}
        disabled={isBusy}
        onClick={() =>
          runAction(`Reactivate organizer "${organizer.name}"?`, activate.mutate)
        }
      >
        {isThisBusy && activate.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Play className="mr-2 size-4" />
        )}
        Activate
      </Button>
    ),
  };

  return <div className="flex flex-wrap gap-2">{actions[organizer.status] ?? null}</div>;
}

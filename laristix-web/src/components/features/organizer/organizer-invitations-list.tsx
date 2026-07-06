"use client";

import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrganizerMemberRoleBadge,
} from "@/components/features/organizer/organizer-member-badges";
import {
  useAcceptOrganizerInvitationMutation,
  useDeclineOrganizerInvitationMutation,
  useOrganizerInvitationsQuery,
} from "@/hooks/use-organizer-invitations";

export function OrganizerInvitationsList() {
  const invitationsQuery = useOrganizerInvitationsQuery();
  const acceptInvitation = useAcceptOrganizerInvitationMutation();
  const declineInvitation = useDeclineOrganizerInvitationMutation();

  if (invitationsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const invitations = invitationsQuery.data ?? [];

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Mail className="size-4" />
        Undangan organizer ({invitations.length})
      </div>
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div className="space-y-1">
              <p className="font-medium">{invitation.organizer?.name ?? "Organizer"}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <OrganizerMemberRoleBadge role={invitation.role} />
                {invitation.invited_by ? (
                  <span>Diundang oleh {invitation.invited_by.name}</span>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={declineInvitation.isPending || acceptInvitation.isPending}
                onClick={() => declineInvitation.mutate(invitation.id)}
              >
                Tolak
              </Button>
              <Button
                size="sm"
                disabled={declineInvitation.isPending || acceptInvitation.isPending}
                onClick={() => acceptInvitation.mutate(invitation.id)}
              >
                Terima
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

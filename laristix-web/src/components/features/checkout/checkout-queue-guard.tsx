"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { routes } from "@/config/env";
import { useJoinWaitingRoomMutation } from "@/hooks/use-waiting-room";
import { getApiErrorMessage } from "@/lib/api/client";
import { getQueueSessionToken, setQueueSessionToken } from "@/lib/waiting-room-session";

interface CheckoutQueueGuardProps {
  eventUuid: string;
  ticketTypeId: number;
  quantity: number;
  children: React.ReactNode;
}

export function CheckoutQueueGuard({
  eventUuid,
  ticketTypeId,
  quantity,
  children,
}: CheckoutQueueGuardProps) {
  const router = useRouter();
  const joinMutation = useJoinWaitingRoomMutation(eventUuid);
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      try {
        const existingToken = getQueueSessionToken(eventUuid) ?? undefined;
        const result = await joinMutation.mutateAsync({
          session_token: existingToken,
          ticket_type_id: ticketTypeId > 0 ? ticketTypeId : undefined,
          quantity,
        });

        if (cancelled) {
          return;
        }

        if (result.session_token) {
          setQueueSessionToken(eventUuid, result.session_token);
        }

        if (result.queue_active && !result.admitted) {
          router.replace(routes.publicEventWaitingRoom(eventUuid, ticketTypeId, quantity));
          return;
        }

        setReady(true);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getApiErrorMessage(error, "Gagal memverifikasi akses checkout."));
          setReady(true);
        }
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventUuid, ticketTypeId, quantity]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Memverifikasi akses checkout...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center text-sm">
        <p className="text-destructive">{errorMessage}</p>
        <button
          type="button"
          className="text-brand underline-offset-4 hover:underline"
          onClick={() => router.push(routes.publicEvent(eventUuid))}
        >
          Kembali ke event
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

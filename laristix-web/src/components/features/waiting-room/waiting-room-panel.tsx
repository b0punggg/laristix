"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock3, Loader2, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/env";
import { useJoinWaitingRoomMutation, useWaitingRoomStatusQuery } from "@/hooks/use-waiting-room";
import { usePublicEventQuery } from "@/hooks/use-public-events";
import { getApiErrorMessage } from "@/lib/api/client";
import { setQueueSessionToken } from "@/lib/waiting-room-session";

interface WaitingRoomPanelProps {
  eventUuid: string;
  ticketTypeId: number;
  quantity: number;
}

function formatWaitDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) {
    return "Segera";
  }

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `~${minutes} menit`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `~${hours} jam ${remainingMinutes} menit` : `~${hours} jam`;
}

export function WaitingRoomPanel({ eventUuid, ticketTypeId, quantity }: WaitingRoomPanelProps) {
  const router = useRouter();
  const eventQuery = usePublicEventQuery(eventUuid);
  const joinMutation = useJoinWaitingRoomMutation(eventUuid);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusQuery = useWaitingRoomStatusQuery(eventUuid, sessionToken, initialized);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const result = await joinMutation.mutateAsync({
          ticket_type_id: ticketTypeId > 0 ? ticketTypeId : undefined,
          quantity,
        });

        if (cancelled) {
          return;
        }

        if (result.session_token) {
          setQueueSessionToken(eventUuid, result.session_token);
          setSessionToken(result.session_token);
        }

        setInitialized(true);

        if (!result.queue_active || result.admitted) {
          router.replace(routes.publicEventCheckout(eventUuid, ticketTypeId, quantity));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getApiErrorMessage(error, "Gagal memasuki ruang tunggu."));
          setInitialized(true);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventUuid, ticketTypeId, quantity]);

  useEffect(() => {
    if (!statusQuery.data?.admitted) {
      return;
    }

    if (statusQuery.data.session_token) {
      setQueueSessionToken(eventUuid, statusQuery.data.session_token);
    }

    router.replace(routes.publicEventCheckout(eventUuid, ticketTypeId, quantity));
  }, [eventUuid, quantity, router, statusQuery.data, ticketTypeId]);

  const status = statusQuery.data;
  const waitingLabel = useMemo(() => {
    if (!status) {
      return "Menyiapkan antrean...";
    }

    if (!status.queue_active) {
      return "Mengalihkan ke checkout...";
    }

    if (status.position) {
      return `Posisi antrean Anda: #${status.position}`;
    }

    return "Anda sedang dalam antrean";
  }, [status]);

  if (errorMessage) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button asChild variant="outline">
            <Link href={routes.publicEvent(eventUuid)}>Kembali ke event</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Users className="size-7" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ruang Tunggu Virtual</h1>
        <p className="text-sm text-muted-foreground">
          {eventQuery.data?.title
            ? `Event populer: ${eventQuery.data.title}`
            : "Kami mengatur pembeli masuk secara bertahap agar checkout tetap stabil."}
        </p>
      </div>

      <Card className="overflow-hidden border-brand/20">
        <CardContent className="space-y-6 p-6">
          <div className="rounded-xl bg-muted/40 p-5 text-center">
            <p className="text-sm text-muted-foreground">Status antrean</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{waitingLabel}</p>
            {status?.estimated_wait_seconds ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Estimasi tunggu: {formatWaitDuration(status.estimated_wait_seconds)}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Menunggu</p>
              <p className="mt-1 text-xl font-semibold">{status?.waiting_count ?? "-"}</p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sedang masuk</p>
              <p className="mt-1 text-xl font-semibold">{status?.admitted_count ?? "-"}</p>
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Di depan Anda</p>
              <p className="mt-1 text-xl font-semibold">{status?.waiting_ahead ?? "-"}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-brand" />
              <p>
                Halaman ini akan otomatis mengalihkan Anda ke checkout saat giliran tiba. Jangan tutup
                tab ini.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
              <p>
                Setelah masuk checkout, waktu pembayaran lebih singkat saat antrean aktif (
                {status?.order_ttl_minutes ?? 12} menit) agar tiket bisa berputar lebih adil.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Memperbarui status antrean...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

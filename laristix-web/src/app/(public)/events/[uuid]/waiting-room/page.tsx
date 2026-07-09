import { Suspense } from "react";
import { WaitingRoomPanel } from "@/components/features/waiting-room/waiting-room-panel";

interface WaitingRoomPageProps {
  params: { uuid: string };
  searchParams: { ticket?: string; qty?: string };
}

function WaitingRoomPageContent({ params, searchParams }: WaitingRoomPageProps) {
  const ticketTypeId = Number(searchParams.ticket ?? 0);
  const quantity = Math.max(1, Number(searchParams.qty ?? 1) || 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <WaitingRoomPanel
        eventUuid={params.uuid}
        ticketTypeId={ticketTypeId}
        quantity={quantity}
      />
    </div>
  );
}

export default function WaitingRoomPage(props: WaitingRoomPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Memuat ruang tunggu...
        </div>
      }
    >
      <WaitingRoomPageContent {...props} />
    </Suspense>
  );
}

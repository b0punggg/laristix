"use client";

import { useSearchParams } from "next/navigation";
import { ScannerPanel } from "@/components/features/check-in/scanner-panel";
import { routes } from "@/config/env";
import { useEventsQuery } from "@/hooks/use-events";

export function ScannerPageContent() {
  const searchParams = useSearchParams();
  const eventUuid = searchParams.get("event") ?? "";

  const eventsQuery = useEventsQuery({ per_page: 100 });
  const events = eventsQuery.data?.data ?? [];
  const selectedEvent = events.find((e) => e.uuid === eventUuid);

  if (!eventUuid) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Pilih event untuk memulai scan check-in.</p>
        {eventsQuery.isLoading ? <p className="text-sm text-muted-foreground">Memuat event...</p> : null}
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.uuid}>
              <a
                href={`${routes.scanner}?event=${event.uuid}`}
                className="text-primary hover:underline"
              >
                {event.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <ScannerPanel eventUuid={eventUuid} eventTitle={selectedEvent?.title} />;
}

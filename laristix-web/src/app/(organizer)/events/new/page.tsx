import { Suspense } from "react";
import { EventForm } from "@/components/features/events/event-form";

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <EventForm mode="create" />
    </Suspense>
  );
}

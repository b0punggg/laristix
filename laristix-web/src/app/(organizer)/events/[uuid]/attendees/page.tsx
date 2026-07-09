import { EventAttendeesPanel } from "@/components/features/events/event-attendees-panel";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function EventAttendeesPage({ params }: PageProps) {
  const { uuid } = await params;

  return <EventAttendeesPanel eventUuid={uuid} />;
}

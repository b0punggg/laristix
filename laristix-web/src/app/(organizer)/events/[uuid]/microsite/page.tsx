import { EventMicrositePanel } from "@/components/features/events/event-microsite-panel";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function EventMicrositePage({ params }: PageProps) {
  const { uuid } = await params;

  return <EventMicrositePanel eventUuid={uuid} />;
}

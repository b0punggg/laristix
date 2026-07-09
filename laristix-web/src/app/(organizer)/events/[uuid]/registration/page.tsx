import { EventRegistrationPanel } from "@/components/features/events/event-registration-panel";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function EventRegistrationPage({ params }: PageProps) {
  const { uuid } = await params;

  return <EventRegistrationPanel eventUuid={uuid} />;
}

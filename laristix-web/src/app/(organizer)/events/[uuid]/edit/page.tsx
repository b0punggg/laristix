import { EventForm } from "@/components/features/events/event-form";

interface EditEventPageProps {
  params: { uuid: string };
}

export default function EditEventPage({ params }: EditEventPageProps) {
  return <EventForm mode="edit" uuid={params.uuid} />;
}

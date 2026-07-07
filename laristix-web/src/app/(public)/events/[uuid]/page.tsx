import { PublicEventDetail } from "@/components/features/public/public-event-detail";

interface PublicEventPageProps {
  params: { uuid: string };
}

export default function PublicEventPage({ params }: PublicEventPageProps) {
  return <PublicEventDetail uuid={params.uuid} />;
}

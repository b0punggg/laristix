import { PublicEventDetail } from "@/components/features/public/public-event-detail";

interface PublicEventPageProps {
  params: { uuid: string };
}

export default function PublicEventPage({ params }: PublicEventPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PublicEventDetail uuid={params.uuid} />
    </div>
  );
}

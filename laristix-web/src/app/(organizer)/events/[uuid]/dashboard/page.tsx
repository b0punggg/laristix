import { EventDashboardPanel } from "@/components/features/events/event-dashboard-panel";

interface EventDashboardPageProps {
  params: { uuid: string };
}

export default function EventDashboardPage({ params }: EventDashboardPageProps) {
  return <EventDashboardPanel eventUuid={params.uuid} />;
}

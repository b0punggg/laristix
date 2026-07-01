import { TicketListPanel } from "@/components/features/tickets/ticket-list-panel";

interface EventTicketsPageProps {
  params: { uuid: string };
}

export default function EventTicketsPage({ params }: EventTicketsPageProps) {
  return <TicketListPanel eventUuid={params.uuid} />;
}

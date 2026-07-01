import { TicketForm } from "@/components/features/tickets/ticket-form";

interface NewTicketPageProps {
  params: { uuid: string };
}

export default function NewTicketPage({ params }: NewTicketPageProps) {
  return <TicketForm eventUuid={params.uuid} mode="create" />;
}

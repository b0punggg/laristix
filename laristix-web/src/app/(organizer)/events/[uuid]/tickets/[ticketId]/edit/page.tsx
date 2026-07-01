import { TicketForm } from "@/components/features/tickets/ticket-form";

interface EditTicketPageProps {
  params: { uuid: string; ticketId: string };
}

export default function EditTicketPage({ params }: EditTicketPageProps) {
  return (
    <TicketForm
      eventUuid={params.uuid}
      mode="edit"
      ticketId={Number(params.ticketId)}
    />
  );
}

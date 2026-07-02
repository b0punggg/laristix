import type { CheckoutOrder, CheckoutOrderEvent } from "@/types/checkout";

export interface PersonalTicket {
  ticketUuid: string;
  ticketCode: string;
  ticketStatus: string;
  checkedInAt: string | null;
  ticketTypeName: string | null;
  event: CheckoutOrderEvent;
  orderUuid: string;
}

export function isActiveTicket(ticket: PersonalTicket): boolean {
  return ticket.ticketStatus === "valid" && !ticket.checkedInAt;
}

export function isCompletedTicket(ticket: PersonalTicket): boolean {
  return ticket.ticketStatus === "used" || Boolean(ticket.checkedInAt);
}

export function extractPersonalTickets(orders: CheckoutOrder[]): PersonalTicket[] {
  return orders
    .filter((order) => order.status === "completed")
    .flatMap((order) =>
      order.registrations
        .filter((registration) => registration.ticket)
        .map((registration) => {
          const ticket = registration.ticket!;
          const matchedItem =
            order.items.find((item) => item.ticket_type_id === registration.ticket_type_id) ??
            order.items[0];

          return {
            ticketUuid: ticket.uuid,
            ticketCode: ticket.ticket_code,
            ticketStatus: ticket.status,
            checkedInAt: ticket.checked_in_at ?? null,
            ticketTypeName: registration.ticket_type_name ?? matchedItem?.ticket_type_name ?? null,
            event: order.event ?? {
              uuid: "",
              title: "Event",
              slug: "",
            },
            orderUuid: order.uuid,
          };
        }),
    );
}

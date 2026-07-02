"use client";

import { Ticket } from "lucide-react";
import { TicketQrDisplay } from "@/components/features/check-in/ticket-qr-display";
import { Button } from "@/components/ui/button";
import { formatTicketEventSchedule } from "@/lib/datetime";
import { formatVenueLabel } from "@/lib/event-display";
import type { PersonalTicket } from "@/lib/my-tickets";

interface ETicketModalProps {
  ticket: PersonalTicket | null;
  open: boolean;
  onClose: () => void;
}

export function ETicketModal({ ticket, open, onClose }: ETicketModalProps) {
  if (!open || !ticket) {
    return null;
  }

  const schedule =
    ticket.event.start_at && ticket.event.end_at
      ? formatTicketEventSchedule(
          ticket.event.start_at,
          ticket.event.end_at,
          ticket.event.timezone,
        )
      : null;
  const venueLabel = formatVenueLabel(ticket.event.venue);
  const isUsed = ticket.ticketStatus === "used" || Boolean(ticket.checkedInAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold">{ticket.event.title}</h2>
          {schedule ? <p className="text-sm text-muted-foreground">{schedule}</p> : null}
          {venueLabel ? <p className="text-sm text-muted-foreground">{venueLabel}</p> : null}
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          {isUsed ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Tiket ini sudah digunakan untuk check-in.
            </div>
          ) : (
            <TicketQrDisplay
              ticketUuid={ticket.ticketUuid}
              ticketCode={ticket.ticketCode}
              status={ticket.ticketStatus}
            />
          )}
          <code className="font-mono text-sm font-semibold tracking-wide">{ticket.ticketCode}</code>
          {ticket.ticketTypeName ? (
            <p className="text-sm text-muted-foreground">{ticket.ticketTypeName}</p>
          ) : null}
        </div>

        <Button type="button" className="mt-6 w-full" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
}

interface PersonalTicketCardProps {
  ticket: PersonalTicket;
  onOpenETicket: (ticket: PersonalTicket) => void;
}

export function PersonalTicketCard({ ticket, onOpenETicket }: PersonalTicketCardProps) {
  const schedule =
    ticket.event.start_at && ticket.event.end_at
      ? formatTicketEventSchedule(
          ticket.event.start_at,
          ticket.event.end_at,
          ticket.event.timezone,
        )
      : null;
  const venueLabel = formatVenueLabel(ticket.event.venue);

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative border-b px-5 py-4">
        <div className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Ticket className="size-4" />
        </div>
        <h3 className="pr-12 text-lg font-bold leading-tight">{ticket.event.title}</h3>
        {schedule ? <p className="mt-2 text-sm text-muted-foreground">{schedule}</p> : null}
        {venueLabel ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{venueLabel}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2 text-primary">
          <Ticket className="size-4 shrink-0" />
          <code className="truncate font-mono text-sm font-medium">{ticket.ticketCode}</code>
        </div>
        <Button type="button" size="sm" className="shrink-0 px-5" onClick={() => onOpenETicket(ticket)}>
          E-Tiket
        </Button>
      </div>
    </article>
  );
}

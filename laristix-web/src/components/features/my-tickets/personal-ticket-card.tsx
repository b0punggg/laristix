"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  QrCode,
  Share2,
  Ticket,
  WalletCards,
} from "lucide-react";
import { TicketQrDisplay } from "@/components/features/check-in/ticket-qr-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { routes } from "@/config/env";
import { formatTicketEventSchedule } from "@/lib/datetime";
import { formatVenueLabel } from "@/lib/event-display";
import type { PersonalTicket } from "@/lib/my-tickets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getTicketStatusMeta(ticket: PersonalTicket) {
  if (ticket.ticketStatus === "used" || ticket.checkedInAt) {
    return {
      label: "Used",
      variant: "muted" as const,
      icon: CheckCircle2,
      description: "Tiket sudah digunakan untuk check-in.",
    };
  }

  return {
    label: "Valid",
    variant: "success" as const,
    icon: Clock3,
    description: "Tiket siap digunakan saat event berlangsung.",
  };
}

function buildPrintableDocument(ticket: PersonalTicket, schedule: string | null, venueLabel: string | null) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${ticket.event.title} - ${ticket.ticketCode}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
      .card { max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 20px; padding: 24px; }
      .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; }
      .title { font-size: 28px; font-weight: 700; margin: 8px 0 6px; }
      .code { margin-top: 20px; padding: 14px 16px; background: #f9fafb; border-radius: 12px; font-family: monospace; font-size: 16px; font-weight: 700; }
      .section { margin-top: 20px; font-size: 14px; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="label">Laristix E-Ticket</div>
      <div class="title">${ticket.event.title}</div>
      ${schedule ? `<div class="section">${schedule}</div>` : ""}
      ${venueLabel ? `<div class="section">${venueLabel}</div>` : ""}
      ${ticket.ticketTypeName ? `<div class="section">Ticket Type: ${ticket.ticketTypeName}</div>` : ""}
      <div class="code">${ticket.ticketCode}</div>
    </div>
  </body>
</html>`;
}

interface ETicketModalProps {
  ticket: PersonalTicket | null;
  open: boolean;
  onClose: () => void;
}

export function ETicketModal({ ticket, open, onClose }: ETicketModalProps) {
  if (!open || !ticket) {
    return null;
  }

  const activeTicket = ticket;

  const schedule =
    activeTicket.event.start_at && activeTicket.event.end_at
      ? formatTicketEventSchedule(
          activeTicket.event.start_at,
          activeTicket.event.end_at,
          activeTicket.event.timezone,
        )
      : null;
  const venueLabel = formatVenueLabel(activeTicket.event.venue);
  const isUsed = activeTicket.ticketStatus === "used" || Boolean(activeTicket.checkedInAt);
  const status = getTicketStatusMeta(activeTicket);
  const StatusIcon = status.icon;

  async function copyTicketDetails() {
    const text = `${activeTicket.event.title}\n${activeTicket.ticketTypeName ?? "E-Ticket"}\nKode: ${activeTicket.ticketCode}`;
    await navigator.clipboard.writeText(text);
    toast.success("Detail tiket disalin.");
  }

  async function handleWallet() {
    const text = `${activeTicket.event.title}\n${activeTicket.ticketTypeName ?? "E-Ticket"}\nKode: ${activeTicket.ticketCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeTicket.event.title,
          text,
          url: window.location.origin + routes.myTickets,
        });
        return;
      } catch {
        // Ignore cancelled shares and fall back to copy below.
      }
    }

    await navigator.clipboard.writeText(text);
    toast.success("Detail tiket disalin untuk disimpan ke wallet atau notes.");
  }

  function handleDownloadPdf() {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      toast.error("Pop-up diblokir. Izinkan pop-up untuk mencetak tiket.");
      return;
    }

    popup.document.open();
    popup.document.write(buildPrintableDocument(activeTicket, schedule, venueLabel));
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-2xl rounded-3xl border-border/80 p-0 shadow-2xl">
        <div className="overflow-hidden rounded-3xl">
          <div className="border-b border-border/80 bg-gradient-to-br from-brand-muted/60 via-background to-background px-6 py-6">
            <DialogHeader className="text-left">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant={status.variant} className="gap-1.5 rounded-full px-3 py-1">
                  <StatusIcon className="size-3.5" />
                  {status.label}
                </Badge>
              </div>
              <DialogTitle className="text-2xl">{activeTicket.event.title}</DialogTitle>
              <DialogDescription className="mt-2 max-w-xl">
                {status.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Event details
                </p>
                {schedule ? <p className="mt-3 text-sm">{schedule}</p> : null}
                {venueLabel ? <p className="mt-1 text-sm text-muted-foreground">{venueLabel}</p> : null}
                {activeTicket.ticketTypeName ? (
                  <p className="mt-3 text-sm font-medium">{activeTicket.ticketTypeName}</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ticket code
                </p>
                <code className="mt-3 block font-mono text-base font-semibold tracking-wide">
                  {activeTicket.ticketCode}
                </code>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={handleDownloadPdf}>
                  <Download className="size-4" />
                  Download PDF
                </Button>
                <Button type="button" variant="outline" onClick={handleWallet}>
                  <WalletCards className="size-4" />
                  Wallet Button
                </Button>
                <Button type="button" variant="outline" onClick={copyTicketDetails}>
                  <Share2 className="size-4" />
                  Transfer Ticket
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={routes.publicEvent(activeTicket.event.uuid)}>
                    Lihat event
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t border-border/80 bg-muted/10 p-6 lg:border-l lg:border-t-0">
              <div className="rounded-[28px] border border-border/80 bg-background p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">QR Code</p>
                    <p className="text-xs text-muted-foreground">Scan saat check-in</p>
                  </div>
                  <QrCode className="size-5 text-brand" />
                </div>

                <div
                  className={cn(
                    "flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed p-4",
                    isUsed ? "border-warning/40 bg-warning-muted/20" : "border-border/80 bg-muted/20",
                  )}
                >
                  {isUsed ? (
                    <div className="space-y-3 text-center">
                      <CheckCircle2 className="mx-auto size-10 text-warning-foreground" />
                      <p className="text-sm font-medium">Tiket ini sudah digunakan untuk check-in.</p>
                    </div>
                  ) : (
                    <TicketQrDisplay
                      ticketUuid={activeTicket.ticketUuid}
                      ticketCode={activeTicket.ticketCode}
                      status={activeTicket.ticketStatus}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/80 px-6 py-4">
            <Button type="button" className="bg-brand hover:bg-brand-hover" onClick={onClose}>
              Tutup
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
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
  const status = getTicketStatusMeta(ticket);
  const StatusIcon = status.icon;

  return (
    <article className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="border-b border-border/80 bg-gradient-to-br from-brand-muted/30 via-background to-background px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status.variant} className="gap-1.5 rounded-full px-3 py-1">
                <StatusIcon className="size-3.5" />
                {status.label}
              </Badge>
              {ticket.ticketTypeName ? (
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {ticket.ticketTypeName}
                </Badge>
              ) : null}
            </div>
            <h3 className="text-xl font-bold leading-tight">{ticket.event.title}</h3>
            {schedule ? <p className="text-sm text-muted-foreground">{schedule}</p> : null}
            {venueLabel ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{venueLabel}</p>
            ) : null}
          </div>

          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-muted text-brand">
            <Ticket className="size-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Ticket code</p>
            <code className="mt-2 block truncate font-mono text-sm font-semibold text-foreground">
              {ticket.ticketCode}
            </code>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-2 text-sm font-semibold">{status.description}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 sm:col-span-2 xl:col-span-1">
            <p className="text-xs text-muted-foreground">Akses cepat</p>
            <p className="mt-2 text-sm font-semibold">QR, PDF, wallet, transfer</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenETicket(ticket)}>
            <QrCode className="size-4" />
            QR Code
          </Button>
          <Button
            type="button"
            className="bg-brand hover:bg-brand-hover"
            onClick={() => onOpenETicket(ticket)}
          >
            Buka E-Ticket
          </Button>
        </div>
      </div>
    </article>
  );
}

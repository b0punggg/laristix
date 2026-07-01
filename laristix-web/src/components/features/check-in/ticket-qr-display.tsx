"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTicketQrQuery } from "@/hooks/use-check-in";

interface TicketQrDisplayProps {
  ticketUuid: string;
  ticketCode: string;
  status: string;
}

export function TicketQrDisplay({ ticketUuid, ticketCode, status }: TicketQrDisplayProps) {
  const { data, isLoading, isError } = useTicketQrQuery(
    ticketUuid,
    status === "valid" || status === "used",
  );

  if (status !== "valid" && status !== "used") {
    return null;
  }

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Memuat QR...</p>;
  }

  if (isError || !data) {
    return <p className="font-mono text-sm font-semibold">{ticketCode}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded border bg-white p-3">
        <QRCodeSVG value={data.qr_payload} size={160} level="M" includeMargin />
      </div>
      <code className="text-xs text-muted-foreground">{ticketCode}</code>
    </div>
  );
}

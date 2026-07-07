import * as React from "react";
import { QrCode, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Text } from "@/design-system/primitives/text";

export interface TicketCardProps {
  eventName: string;
  ticketType: string;
  holderName?: string;
  status?: "valid" | "used" | "cancelled";
  qrSlot?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const statusVariant = {
  valid: "success",
  used: "muted",
  cancelled: "danger",
} as const;

const statusLabel = {
  valid: "Valid",
  used: "Sudah digunakan",
  cancelled: "Dibatalkan",
} as const;

export function TicketCard({
  eventName,
  ticketType,
  holderName,
  status = "valid",
  qrSlot,
  actions,
  className,
}: TicketCardProps) {
  return (
    <Card variant="elevated" className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Text variant="overline">Tiket</Text>
            <Text variant="h4" className="mt-1 line-clamp-2">
              {eventName}
            </Text>
            <Text variant="caption" className="mt-1">
              {ticketType}
            </Text>
          </div>
          <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
        </div>
        {holderName ? (
          <div className="rounded-lg bg-muted px-3 py-2">
            <Text variant="caption">Pemegang tiket</Text>
            <p className="text-sm font-medium">{holderName}</p>
          </div>
        ) : null}
        <div className="flex items-center justify-center rounded-xl border border-dashed bg-surface p-6">
          {qrSlot ?? <QrCode className="size-16 text-muted-foreground/50" aria-hidden />}
        </div>
      </CardContent>
      {actions ? (
        <CardFooter className="border-t bg-muted/30 p-4">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ticket className="size-3.5" aria-hidden />
              Laristix
            </span>
            <div className="flex gap-2">{actions}</div>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}

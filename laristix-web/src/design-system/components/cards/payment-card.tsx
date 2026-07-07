import * as React from "react";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Text } from "@/design-system/primitives/text";

export interface PaymentCardProps {
  amount: string;
  method?: string;
  reference?: string;
  date?: string;
  status?: "pending" | "paid" | "failed" | "refunded";
  actions?: React.ReactNode;
  className?: string;
}

const statusVariant = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "info",
} as const;

const statusLabel = {
  pending: "Menunggu",
  paid: "Lunas",
  failed: "Gagal",
  refunded: "Dikembalikan",
} as const;

export function PaymentCard({
  amount,
  method,
  reference,
  date,
  status = "pending",
  actions,
  className,
}: PaymentCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-muted text-brand">
              <CreditCard className="size-5" aria-hidden />
            </div>
            <div>
              <Text variant="caption">Pembayaran</Text>
              <p className="text-xl font-bold tracking-tight">{amount}</p>
            </div>
          </div>
          <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
        </div>
        <dl className="grid gap-2 text-sm">
          {method ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Metode</dt>
              <dd className="font-medium">{method}</dd>
            </div>
          ) : null}
          {reference ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Referensi</dt>
              <dd className="font-mono text-xs">{reference}</dd>
            </div>
          ) : null}
          {date ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tanggal</dt>
              <dd>{date}</dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
      {actions ? <CardFooter className="border-t p-4">{actions}</CardFooter> : null}
    </Card>
  );
}

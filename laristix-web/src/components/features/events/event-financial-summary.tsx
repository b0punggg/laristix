"use client";

import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIdr } from "@/lib/format";
import type { EventDashboardSummary } from "@/types/organizer";

interface EventFinancialSummaryProps {
  summary?: EventDashboardSummary;
  isLoading?: boolean;
  isError?: boolean;
}

function SummaryRow({
  label,
  value,
  hint,
  emphasis,
  negative,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 ${
        emphasis ? "border-t-2 border-foreground/10 pt-4" : "border-b border-border/60 last:border-b-0"
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm ${emphasis ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
          {label}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <p
        className={`shrink-0 text-right font-semibold tabular-nums ${
          emphasis ? "text-lg text-foreground" : negative ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function EventFinancialSummary({ summary, isLoading, isError }: EventFinancialSummaryProps) {
  const totals = summary?.totals;
  const today = summary?.today;
  const isFree = summary?.event.is_free ?? false;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="size-4 text-brand" aria-hidden />
          Ringkasan keuangan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Gagal memuat ringkasan keuangan.
          </p>
        ) : isFree ? (
          <p className="py-4 text-sm text-muted-foreground">
            Event gratis — tidak ada penjualan tiket berbayar.
          </p>
        ) : (
          <div className="space-y-1">
            <SummaryRow
              label="Total Penjualan Tiket Online"
              value={formatIdr(totals?.ticket_sales_gross ?? 0)}
              hint={
                today
                  ? `Hari ini: ${formatIdr(today.ticket_sales_gross)}`
                  : "Sebelum dikurangi promo dan biaya layanan"
              }
            />
            <SummaryRow
              label="Total Promo"
              value={
                (totals?.promo_total ?? 0) > 0
                  ? `− ${formatIdr(totals?.promo_total ?? 0)}`
                  : formatIdr(0)
              }
              hint={
                (totals?.promo_usage_count ?? 0) > 0
                  ? `${totals?.promo_usage_count} transaksi memakai promo`
                  : "Belum ada penggunaan kode promo"
              }
              negative={(totals?.promo_total ?? 0) > 0}
            />
            <SummaryRow
              label="Biaya Layanan Penjualan Tiket Online"
              value={
                (totals?.platform_fees ?? 0) > 0
                  ? `− ${formatIdr(totals?.platform_fees ?? 0)}`
                  : formatIdr(0)
              }
              hint="Biaya platform untuk penjualan tiket"
              negative={(totals?.platform_fees ?? 0) > 0}
            />
            <SummaryRow
              label="Quotation"
              value={
                (totals?.quotation_total ?? 0) > 0
                  ? `− ${formatIdr(totals?.quotation_total ?? 0)}`
                  : formatIdr(0)
              }
              hint="Biaya layanan tambahan untuk event ini"
              negative={(totals?.quotation_total ?? 0) > 0}
            />
            <SummaryRow
              label="Total Pendapatan"
              value={formatIdr(totals?.revenue_net ?? 0)}
              hint={
                today
                  ? `Hari ini: ${formatIdr(today.revenue_net)} · Dibayar pembeli: ${formatIdr(totals?.revenue_gross ?? 0)}`
                  : `Dibayar pembeli: ${formatIdr(totals?.revenue_gross ?? 0)}`
              }
              emphasis
            />
            <SummaryRow
              label="Dana yang Belum Ditarik"
              value={formatIdr(totals?.available_to_withdraw ?? 0)}
              hint={`Sudah ditarik: ${formatIdr(totals?.withdrawn_total ?? 0)} · Menunggu proses: ${formatIdr(totals?.pending_withdrawal_total ?? 0)}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

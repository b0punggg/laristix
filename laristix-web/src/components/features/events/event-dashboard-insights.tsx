"use client";

import { AlertTriangle, ShoppingBag, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIdr } from "@/lib/format";
import type { EventDashboardInsights } from "@/types/organizer";

interface EventDashboardInsightsPanelProps {
  insights?: EventDashboardInsights;
  isLoading?: boolean;
  isError?: boolean;
}

export function EventDashboardInsightsPanel({
  insights,
  isLoading,
  isError,
}: EventDashboardInsightsPanelProps) {
  return (
    <div className="space-y-6">
      {(insights?.attention_items.length ?? 0) > 0 ? (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-600" aria-hidden />
              Perlu perhatian
              <Badge variant="warning">{insights?.attention_items.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights?.attention_items.map((item, index) => (
                <li key={`${item.type}-${index}`} className="text-sm text-foreground">
                  {item.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ticket className="size-4 text-brand" aria-hidden />
              Breakdown per tiket
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : isError ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Gagal memuat breakdown tiket.
              </p>
            ) : (insights?.ticket_breakdown.length ?? 0) === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada tipe tiket atau penjualan.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">Tipe</th>
                      <th className="pb-2 pr-3 font-medium">Terjual</th>
                      <th className="pb-2 pr-3 font-medium">Sisa</th>
                      <th className="pb-2 font-medium text-right">Gross</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {insights?.ticket_breakdown.map((row) => (
                      <tr key={row.ticket_type_id}>
                        <td className="py-3 pr-3 font-medium text-foreground">{row.name}</td>
                        <td className="py-3 pr-3 text-muted-foreground">
                          {row.sold}
                          {row.quantity > 0 ? ` / ${row.quantity}` : ""}
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">{row.remaining}</td>
                        <td className="py-3 text-right font-medium">{formatIdr(row.revenue_gross)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="size-4 text-brand" aria-hidden />
              Order terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : isError ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Gagal memuat order terbaru.
              </p>
            ) : (insights?.recent_orders.length ?? 0) === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada transaksi untuk event ini.
              </p>
            ) : (
              <div className="divide-y">
                {insights?.recent_orders.map((order) => (
                  <div
                    key={order.uuid}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{order.buyer_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.order_number}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.buyer_email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-foreground">
                        {formatIdr(order.organizer_net_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.paid_at
                          ? new Date(order.paid_at).toLocaleString("id-ID")
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

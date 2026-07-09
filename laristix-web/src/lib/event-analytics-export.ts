import { downloadCsv } from "@/lib/export-csv";
import type {
  EventDashboardInsights,
  EventDashboardSummary,
  OrganizerTrendPoint,
} from "@/types/organizer";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function exportEventSummaryCsv(summary: EventDashboardSummary) {
  const { event, totals, today } = summary;
  const slug = slugify(event.title);

  downloadCsv(
    `ringkasan-event-${slug}-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Metrik", "Total", "Hari ini"],
    [
      ["Event", event.title, ""],
      ["Status", event.status, ""],
      ["Registrasi", totals.registrations, today.registrations],
      ["Tiket terjual", totals.tickets_sold, ""],
      ["Tiket tersisa", totals.tickets_remaining, ""],
      ["Order selesai", totals.orders_completed, today.orders],
      ["Check-in", totals.check_ins, today.check_ins],
      ["Pendapatan net", totals.revenue_net, today.revenue_net],
      ["Pendapatan gross", totals.revenue_gross, today.revenue_gross],
      ["Biaya platform", totals.platform_fees, ""],
    ],
  );
}

export function exportEventTrendsCsv(
  series: OrganizerTrendPoint[],
  days: number,
  eventTitle: string,
) {
  const slug = slugify(eventTitle);

  downloadCsv(
    `tren-event-${slug}-${days}h-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Tanggal", "Order", "Pendapatan net", "Pendapatan gross", "Biaya platform", "Check-in"],
    series.map((point) => [
      point.date,
      point.orders,
      point.revenue_net,
      point.revenue_gross,
      point.platform_fees,
      point.check_ins,
    ]),
  );
}

export function exportEventTicketBreakdownCsv(insights: EventDashboardInsights, eventTitle: string) {
  const slug = slugify(eventTitle);

  downloadCsv(
    `breakdown-tiket-${slug}-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Tipe tiket", "Terjual", "Kuota", "Sisa", "Pendapatan gross"],
    insights.ticket_breakdown.map((row) => [
      row.name,
      row.sold,
      row.quantity,
      row.remaining,
      row.revenue_gross,
    ]),
  );
}

export function exportEventRecentOrdersCsv(insights: EventDashboardInsights, eventTitle: string) {
  const slug = slugify(eventTitle);

  downloadCsv(
    `order-terbaru-${slug}-${new Date().toISOString().slice(0, 10)}.csv`,
    ["No. order", "Pembeli", "Email", "Status", "Net", "Gross", "Dibayar"],
    insights.recent_orders.map((order) => [
      order.order_number,
      order.buyer_name,
      order.buyer_email,
      order.status,
      order.organizer_net_amount,
      order.total_amount,
      order.paid_at ?? "",
    ]),
  );
}

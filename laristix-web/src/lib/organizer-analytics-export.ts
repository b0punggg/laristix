import { downloadCsv } from "@/lib/export-csv";
import type {
  OrganizerDashboardSummary,
  OrganizerDashboardTrends,
  OrganizerTopEventByRevenue,
  OrganizerTrendPoint,
} from "@/types/organizer";

export function exportOrganizerTopEventsCsv(items: OrganizerTopEventByRevenue[]) {
  downloadCsv(
    `event-terlaris-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Event", "Status", "Pendapatan net", "Pendapatan gross", "Jumlah order"],
    items.map((item) => [
      item.event.title,
      item.event.status,
      item.revenue_net,
      item.revenue_gross,
      item.orders_count,
    ]),
  );
}

export function exportOrganizerTrendsCsv(series: OrganizerTrendPoint[], days: number) {
  downloadCsv(
    `tren-organizer-${days}h-${new Date().toISOString().slice(0, 10)}.csv`,
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

export function exportOrganizerSummaryCsv(summary: OrganizerDashboardSummary) {
  const { totals, today } = summary;

  downloadCsv(
    `ringkasan-organizer-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Metrik", "Total", "Hari ini"],
    [
      ["Event", totals.events, ""],
      ["Event published", totals.events_published, ""],
      ["Event draft", totals.events_draft, ""],
      ["Registrasi", totals.registrations, today.registrations],
      ["Tiket terjual", totals.tickets_sold, ""],
      ["Order selesai", totals.orders_completed, today.orders],
      ["Check-in", totals.check_ins, today.check_ins],
      ["Pendapatan net", totals.revenue_net, today.revenue_net],
      ["Pendapatan gross", totals.revenue_gross, today.revenue_gross],
      ["Biaya platform", totals.platform_fees, ""],
    ],
  );
}

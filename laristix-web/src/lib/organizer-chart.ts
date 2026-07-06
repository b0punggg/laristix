import type { AnalyticsTrendPoint } from "@/types/admin";
import type { OrganizerTrendPoint } from "@/types/organizer";

export function toOrganizerChartSeries(series: OrganizerTrendPoint[]): AnalyticsTrendPoint[] {
  return series.map((point) => ({
    date: point.date,
    orders: point.orders,
    revenue_gross: point.revenue_net,
    platform_fees: point.platform_fees,
    check_ins: point.check_ins,
  }));
}

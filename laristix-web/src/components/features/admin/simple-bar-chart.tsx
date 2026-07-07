"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatShortDate } from "@/lib/format";
import type { AnalyticsTrendPoint } from "@/types/admin";

type ChartValueKey = keyof Pick<
  AnalyticsTrendPoint,
  "orders" | "revenue_gross" | "check_ins" | "platform_fees"
>;

interface SimpleBarChartProps {
  data: AnalyticsTrendPoint[];
  valueKey: ChartValueKey;
  label: string;
  formatValue?: (value: number) => string;
}

interface ChartPoint extends AnalyticsTrendPoint {
  value: number;
  shortDate: string;
}

function formatDefault(value: number) {
  return String(value);
}

const CHART_PRIMARY = "hsl(var(--brand))";

export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  formatValue: (value: number) => string;
}) {
  if (!active || !payload?.[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{formatShortDate(point.date)}</p>
      <p className="mt-1 text-muted-foreground">{formatValue(point.value)}</p>
    </div>
  );
}

export function SimpleBarChart({
  data,
  valueKey,
  label,
  formatValue = formatDefault,
}: SimpleBarChartProps) {
  const chartData = useMemo<ChartPoint[]>(
    () =>
      data.map((point) => ({
        ...point,
        value: point[valueKey],
        shortDate: formatShortDate(point.date),
      })),
    [data, valueKey],
  );

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { total: 0, peak: 0, peakDate: "" };
    }

    let total = 0;
    let peak = 0;
    let peakDate = chartData[0].date;

    for (const point of chartData) {
      total += point.value;

      if (point.value > peak) {
        peak = point.value;
        peakDate = point.date;
      }
    }

    return { total, peak, peakDate };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No data yet"
        description="Trends will appear once platform activity is recorded."
        className="py-8"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          Total {formatValue(stats.total)} · Peak {formatValue(stats.peak)}
          {stats.peakDate ? ` (${formatShortDate(stats.peakDate)})` : ""}
        </p>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value: number) => formatValue(value)}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              content={<ChartTooltip formatValue={formatValue} />}
            />
            <Bar
              dataKey="value"
              fill={CHART_PRIMARY}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { BarChart3, DollarSign, FileSpreadsheet, ScanLine, Ticket, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { RefreshButton } from "@/components/common/refresh-button";
import { AdminMetricCard, AdminMetricCardSkeleton } from "@/components/features/admin/admin-metric-card";
import { ChartSkeleton, SimpleBarChart } from "@/components/features/admin/simple-bar-chart";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import {
  formatIdr,
  formatNumber,
  useAdminAnalyticsTrendsQuery,
  useAdminDashboardSummaryQuery,
} from "@/hooks/use-admin-analytics";

export function AdminAnalyticsPanel() {
  const [days, setDays] = useState(30);
  const summaryQuery = useAdminDashboardSummaryQuery();
  const trendsQuery = useAdminAnalyticsTrendsQuery(days);

  const totals = summaryQuery.data?.totals;
  const series = useMemo(
    () => trendsQuery.data?.series ?? [],
    [trendsQuery.data?.series],
  );

  const periodTotals = useMemo(() => {
    return series.reduce(
      (acc, point) => ({
        orders: acc.orders + point.orders,
        revenue_gross: acc.revenue_gross + point.revenue_gross,
        platform_fees: acc.platform_fees + point.platform_fees,
        check_ins: acc.check_ins + point.check_ins,
      }),
      { orders: 0, revenue_gross: 0, platform_fees: 0, check_ins: 0 },
    );
  }, [series]);

  const refreshAll = () => {
    void summaryQuery.refetch();
    void trendsQuery.refetch();
  };

  const isRefreshing = summaryQuery.isFetching || trendsQuery.isFetching;
  const lastUpdated = Math.max(summaryQuery.dataUpdatedAt, trendsQuery.dataUpdatedAt);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Analytics & Revenue</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Platform-wide performance metrics, revenue visibility, operational reports, and
              executive insights for modern SaaS administration.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="trend-days">
                Period
              </label>
              <Select
                id="trend-days"
                value={String(days)}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-32"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </Select>
            </div>
            <RefreshButton
              onRefresh={refreshAll}
              isFetching={isRefreshing}
              updatedAt={lastUpdated}
            />
          </div>
        </div>
      </section>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">All-time totals</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryQuery.isLoading ? (
            <>
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
              <AdminMetricCardSkeleton />
            </>
          ) : (
            <>
              <AdminMetricCard
                title="Revenue"
                value={totals ? formatIdr(totals.revenue_gross) : "—"}
                icon={DollarSign}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Platform fees"
                value={totals ? formatIdr(totals.platform_fees) : "—"}
                icon={TrendingUp}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Tickets sold"
                value={totals ? formatNumber(totals.tickets_sold) : "—"}
                icon={Ticket}
                isError={summaryQuery.isError}
              />
              <AdminMetricCard
                title="Check-ins"
                value={totals ? formatNumber(totals.check_ins) : "—"}
                icon={ScanLine}
                isError={summaryQuery.isError}
              />
            </>
          )}
        </div>
      </div>

      <FormSectionCard
        title="Business Lenses"
        description="Shortcut views for reporting, analytics, users, and revenue conversations."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Revenue", icon: DollarSign, body: "Gross revenue and fee performance." },
            { title: "Reports", icon: FileSpreadsheet, body: "Operational reporting and export surfaces." },
            { title: "Analytics", icon: BarChart3, body: "Trends, demand, and activity patterns." },
            { title: "Users", icon: Users, body: "User and organizer behavior visibility." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                  <Icon className="size-5" />
                </div>
                <p className="mt-4 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            );
          })}
        </div>
      </FormSectionCard>

      {!trendsQuery.isLoading && !trendsQuery.isError && series.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orders ({days}d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatNumber(periodTotals.orders)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue ({days}d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatIdr(periodTotals.revenue_gross)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fees ({days}d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatIdr(periodTotals.platform_fees)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Check-ins ({days}d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatNumber(periodTotals.check_ins)}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {trendsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="rounded-3xl border-border/80 shadow-sm">
              <CardContent className="pt-6">
                <ChartSkeleton />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : trendsQuery.isError ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={BarChart3}
              title="Failed to load analytics"
              description="We could not fetch trend data for this period."
            >
              <Button variant="outline" onClick={() => trendsQuery.refetch()}>
                Try again
              </Button>
            </EmptyState>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={series} valueKey="orders" label="Daily orders" />
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={series}
                valueKey="revenue_gross"
                label="Daily revenue"
                formatValue={formatIdr}
              />
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={series} valueKey="check_ins" label="Daily check-ins" />
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Platform fees</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={series}
                valueKey="platform_fees"
                label="Daily platform fees"
                formatValue={formatIdr}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

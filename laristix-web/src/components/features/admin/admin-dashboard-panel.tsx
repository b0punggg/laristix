"use client";

import Link from "next/link";
import {
  BellRing,
  Building2,
  Calendar,
  FileCode2,
  DollarSign,
  LockKeyhole,
  Megaphone,
  ScanLine,
  Settings,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { RefreshButton } from "@/components/common/refresh-button";
import { AdminMetricCard } from "@/components/features/admin/admin-metric-card";
import { ChartSkeleton, SimpleBarChart } from "@/components/features/admin/simple-bar-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import {
  formatIdr,
  useAdminAnalyticsTrendsQuery,
  useAdminDashboardSummaryQuery,
} from "@/hooks/use-admin-analytics";
import { usePendingOrganizersQuery } from "@/hooks/use-admin-organizers";
import { routes } from "@/config/env";

export function AdminDashboardPanel() {
  const summaryQuery = useAdminDashboardSummaryQuery();
  const trendsQuery = useAdminAnalyticsTrendsQuery(14);
  const pendingQuery = usePendingOrganizersQuery();

  const totals = summaryQuery.data?.totals;
  const today = summaryQuery.data?.today;
  const pendingCount = pendingQuery.data?.length ?? totals?.organizers_pending ?? 0;
  const trendSeries = trendsQuery.data?.series ?? [];

  const refreshAll = () => {
    void summaryQuery.refetch();
    void trendsQuery.refetch();
    void pendingQuery.refetch();
  };

  const isRefreshing =
    summaryQuery.isFetching || trendsQuery.isFetching || pendingQuery.isFetching;

  const lastUpdated = Math.max(
    summaryQuery.dataUpdatedAt,
    trendsQuery.dataUpdatedAt,
    pendingQuery.dataUpdatedAt,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/70">
              Modern SaaS admin dashboard
            </p>
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Dashboard</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                High-level visibility into organizers, revenue, ticket activity, approvals,
                compliance, and platform operations.
              </p>
            </div>
          </div>
          <RefreshButton
            onRefresh={refreshAll}
            isFetching={isRefreshing}
            updatedAt={lastUpdated}
          />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title="Revenue"
          value={totals ? formatIdr(totals.revenue_gross) : 0}
          subtitle={`Today: ${today ? formatIdr(today.revenue_gross) : formatIdr(0)}`}
          icon={DollarSign}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <AdminMetricCard
          title="Platform fees"
          value={totals ? formatIdr(totals.platform_fees) : 0}
          subtitle="Total collected fees"
          icon={TrendingUp}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <AdminMetricCard
          title="Tickets sold"
          value={totals?.tickets_sold ?? 0}
          subtitle={`${totals?.orders_completed ?? 0} completed orders`}
          icon={Ticket}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
        <AdminMetricCard
          title="Check-ins"
          value={totals?.check_ins ?? 0}
          subtitle={`Today: ${today?.check_ins ?? 0}`}
          icon={ScanLine}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryQuery.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{totals?.events ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">Total events platform-wide</p>
            <Button asChild size="sm">
              <Link href={routes.adminEvents}>View all events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending organizers
            </CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingQuery.isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{pendingCount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {totals?.organizers_active ?? 0} active organizers
            </p>
            <Button asChild size="sm" variant={pendingCount ? "default" : "outline"}>
              <Link href={routes.adminOrganizers}>
                {pendingCount ? "Review approvals" : "View organizers"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">14-day trends</CardTitle>
            <p className="text-sm text-muted-foreground">Orders and revenue over the last two weeks</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.adminAnalytics}>Full analytics</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {trendsQuery.isLoading ? (
            <div className="space-y-8">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : trendsQuery.isError ? (
            <EmptyState
              icon={TrendingUp}
              title="Could not load trends"
              description="Check your connection and try again."
            >
              <Button variant="outline" size="sm" onClick={() => trendsQuery.refetch()}>
                Try again
              </Button>
            </EmptyState>
          ) : (
            <>
              <SimpleBarChart
                data={trendSeries}
                valueKey="orders"
                label="Daily orders"
              />
              <SimpleBarChart
                data={trendSeries}
                valueKey="revenue_gross"
                label="Daily revenue"
                formatValue={formatIdr}
              />
            </>
          )}
        </CardContent>
      </Card>

      <FormSectionCard
        title="Admin Workspaces"
        description="Surface major platform admin areas in one premium overview."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Reports",
              description: "Revenue, check-ins, and platform trends.",
              href: routes.adminAnalytics,
              icon: TrendingUp,
            },
            {
              title: "CMS",
              description: "Content, homepage blocks, and platform copy.",
              href: routes.adminSettings,
              icon: FileCode2,
            },
            {
              title: "Notification Templates",
              description: "Email and operational messaging surfaces.",
              href: routes.adminSettings,
              icon: Megaphone,
            },
            {
              title: "Permissions UI",
              description: "Role-based controls and access governance.",
              href: routes.adminSettings,
              icon: LockKeyhole,
            },
            {
              title: "Audit Logs",
              description: "Track admin actions and system changes.",
              href: routes.adminLogs,
              icon: BellRing,
            },
            {
              title: "Platform Settings",
              description: "Maintenance mode, fee rules, and defaults.",
              href: routes.adminSettings,
              icon: Settings,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                  <Icon className="size-5" />
                </div>
                <p className="mt-4 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </FormSectionCard>
    </div>
  );
}

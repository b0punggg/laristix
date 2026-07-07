"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, FileText, Loader2, ScrollText, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPagination } from "@/components/common/list-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { RefreshButton } from "@/components/common/refresh-button";
import { useActivityLogsQuery, useAuditLogsQuery } from "@/hooks/use-admin-analytics";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { exportActivityLogsCsv, exportAuditLogsCsv } from "@/lib/admin-logs-export";
import { formatDateId } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/api/client";
import { adminApi } from "@/services/admin/admin-api";
import type { ActivityLogEntry, AuditLogEntry, LogListFilters } from "@/types/admin";
import { cn } from "@/lib/utils";
import { FormSectionCard, FormTabButton } from "@/components/features/events/event-management-ui";

const auditCategories = ["", "auth", "financial", "admin", "security", "system"] as const;

const categoryStyles: Record<string, string> = {
  auth: "bg-blue-100 text-blue-800",
  financial: "bg-emerald-100 text-emerald-800",
  admin: "bg-violet-100 text-violet-800",
  security: "bg-red-100 text-red-800",
  system: "bg-slate-100 text-slate-800",
};

function LogRowSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="mt-3 h-3 w-64" />
    </div>
  );
}

function JsonDetails({ label, data }: { label: string; data: Record<string, unknown> | null }) {
  const [open, setOpen] = useState(false);

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        {label}
      </button>
      {open ? (
        <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

export function AdminLogsPanel() {
  const [tab, setTab] = useState<"activity" | "audit">("audit");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, category]);

  const filters = useMemo<LogListFilters>(
    () => ({
      page,
      per_page: 20,
      ...(tab === "activity" ? { action: debouncedSearch.trim() || undefined } : {}),
      ...(tab === "audit"
        ? {
            event: debouncedSearch.trim() || undefined,
            category: category || undefined,
          }
        : {}),
    }),
    [tab, debouncedSearch, category, page],
  );

  const exportFilters = useMemo<Omit<LogListFilters, "page" | "per_page">>(
    () => ({
      ...(tab === "activity" ? { action: debouncedSearch.trim() || undefined } : {}),
      ...(tab === "audit"
        ? {
            event: debouncedSearch.trim() || undefined,
            category: category || undefined,
          }
        : {}),
    }),
    [tab, debouncedSearch, category],
  );

  const activityQuery = useActivityLogsQuery(filters, tab === "activity");
  const auditQuery = useAuditLogsQuery(filters, tab === "audit");

  const activeQuery = tab === "activity" ? activityQuery : auditQuery;
  const entries = activeQuery.data?.data ?? [];
  const meta = activeQuery.data?.meta;
  const totalEntries = meta?.total ?? 0;

  async function handleExportAll() {
    setIsExportingAll(true);

    try {
      if (tab === "activity") {
        const allEntries = await adminApi.fetchAllActivityLogs(exportFilters);

        if (allEntries.length === 0) {
          toast.info("No activity logs to export.");
          return;
        }

        exportActivityLogsCsv(allEntries);
        toast.success(`Exported ${allEntries.length} activity log(s).`);
        return;
      }

      const allEntries = await adminApi.fetchAllAuditLogs(exportFilters);

      if (allEntries.length === 0) {
        toast.info("No audit logs to export.");
        return;
      }

      exportAuditLogsCsv(allEntries);
      toast.success(`Exported ${allEntries.length} audit log(s).`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to export logs."));
    } finally {
      setIsExportingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Audit Logs</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Track platform activity, audit history, security-sensitive changes, and reporting exports.
            </p>
          </div>
          <RefreshButton
            onRefresh={() => activeQuery.refetch()}
            isFetching={activeQuery.isFetching}
            updatedAt={activeQuery.dataUpdatedAt}
          />
        </div>
      </section>

      <FormSectionCard
        title="Log Categories"
        description="High-signal lenses for audit, activity, security, and compliance review."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Audit Logs", icon: ScrollText, body: "Configuration and state changes." },
            { title: "Activity Logs", icon: FileText, body: "Operational user actions." },
            { title: "Security", icon: Shield, body: "Sensitive and access-related events." },
            { title: "Exports", icon: Sparkles, body: "Reporting and investigation workflows." },
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

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <FormTabButton active={tab === "audit"} onClick={() => setTab("audit")}>
          <ScrollText className="mr-2 size-4" />
          Audit logs
        </FormTabButton>
        <FormTabButton active={tab === "activity"} onClick={() => setTab("activity")}>
          <FileText className="mr-2 size-4" />
          Activity logs
        </FormTabButton>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder={tab === "audit" ? "Search event..." : "Search action..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-sm"
          />
          {tab === "audit" ? (
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sm:w-40"
            >
              {auditCategories.map((item) => (
                <option key={item || "all"} value={item}>
                  {item ? item : "All categories"}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={entries.length === 0}
            onClick={() =>
              tab === "activity"
                ? exportActivityLogsCsv(entries as ActivityLogEntry[])
                : exportAuditLogsCsv(entries as AuditLogEntry[])
            }
          >
            <Download className="mr-2 size-4" />
            Export page
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={totalEntries === 0 || isExportingAll}
            onClick={() => void handleExportAll()}
          >
            {isExportingAll ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {isExportingAll ? "Exporting..." : `Export all (${totalEntries})`}
          </Button>
        </div>
      </div>

      {activeQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <LogRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {activeQuery.isError ? (
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardContent>
            <EmptyState
              icon={ScrollText}
              title="Failed to load logs"
              description="Something went wrong while fetching log entries."
            >
              <Button variant="outline" onClick={() => activeQuery.refetch()}>
                Try again
              </Button>
            </EmptyState>
          </CardContent>
        </Card>
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && entries.length === 0 ? (
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardContent>
            <EmptyState
              icon={tab === "audit" ? ScrollText : FileText}
              title="No logs found"
              description="Try adjusting filters or check back after more platform activity."
            />
          </CardContent>
        </Card>
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && entries.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Showing {entries.length} of {meta?.total ?? entries.length} entries
          </p>

          <div className="hidden overflow-x-auto rounded-3xl border border-border/80 md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Event / Action</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Context</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isAudit = "event" in entry;

                  return (
                    <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium">
                          {isAudit ? entry.event : entry.action}
                        </p>
                        {isAudit ? (
                          <Badge
                            variant="secondary"
                            className={cn("mt-1 text-[10px]", categoryStyles[entry.category])}
                          >
                            {entry.category}
                          </Badge>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {entry.subject_type} #{entry.subject_id}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {entry.user ? (
                          <>
                            <p className="font-medium text-foreground">{entry.user.name}</p>
                            <p className="text-xs">{entry.user.email}</p>
                          </>
                        ) : (
                          "System"
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                        {entry.organizer ? <p>Organizer: {entry.organizer.name}</p> : null}
                        {entry.ip_address ? <p>IP: {entry.ip_address}</p> : null}
                        {isAudit ? (
                          <>
                            <JsonDetails label="Old values" data={entry.old_values} />
                            <JsonDetails label="New values" data={entry.new_values} />
                            <JsonDetails label="Metadata" data={entry.metadata} />
                          </>
                        ) : (
                          <JsonDetails label="Properties" data={entry.properties} />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-muted-foreground">
                        {formatDateId(entry.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {entries.map((entry) => {
              const isAudit = "event" in entry;

              return (
                <Card key={entry.id} className="rounded-3xl border-border/80 shadow-sm">
                  <CardContent className="space-y-2 pt-4 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{isAudit ? entry.event : entry.action}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDateId(entry.created_at)}
                      </span>
                    </div>
                    {isAudit ? (
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px]", categoryStyles[entry.category])}
                      >
                        {entry.category}
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {entry.subject_type} #{entry.subject_id}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      {entry.user ? `${entry.user.name} (${entry.user.email})` : "System"}
                    </p>
                    {entry.organizer ? (
                      <p className="text-muted-foreground">Organizer: {entry.organizer.name}</p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {meta ? <ListPagination meta={meta} onPageChange={setPage} /> : null}
        </div>
      ) : null}
    </div>
  );
}

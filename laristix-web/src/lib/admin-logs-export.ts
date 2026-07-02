import { downloadCsv } from "@/lib/export-csv";
import type { ActivityLogEntry, AuditLogEntry } from "@/types/admin";

function formatActor(entry: ActivityLogEntry | AuditLogEntry) {
  return entry.user ? `${entry.user.name} <${entry.user.email}>` : "System";
}

export function exportActivityLogsCsv(entries: ActivityLogEntry[], filenamePrefix = "activity-logs") {
  downloadCsv(
    `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`,
    ["ID", "Action", "Subject", "User", "Organizer", "IP", "Properties", "Created at"],
    entries.map((entry) => [
      entry.id,
      entry.action,
      `${entry.subject_type}#${entry.subject_id}`,
      formatActor(entry),
      entry.organizer?.name ?? "",
      entry.ip_address ?? "",
      entry.properties ? JSON.stringify(entry.properties) : "",
      entry.created_at,
    ]),
  );
}

export function exportAuditLogsCsv(entries: AuditLogEntry[], filenamePrefix = "audit-logs") {
  downloadCsv(
    `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`,
    [
      "ID",
      "Event",
      "Category",
      "User",
      "Organizer",
      "IP",
      "Old values",
      "New values",
      "Metadata",
      "Created at",
    ],
    entries.map((entry) => [
      entry.id,
      entry.event,
      entry.category,
      formatActor(entry),
      entry.organizer?.name ?? "",
      entry.ip_address ?? "",
      entry.old_values ? JSON.stringify(entry.old_values) : "",
      entry.new_values ? JSON.stringify(entry.new_values) : "",
      entry.metadata ? JSON.stringify(entry.metadata) : "",
      entry.created_at,
    ]),
  );
}

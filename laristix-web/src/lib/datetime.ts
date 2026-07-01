export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Convert datetime-local input to an ISO-8601 string with explicit WIB offset.
 * Avoids UTC conversion that shifts sales windows when the backend uses Asia/Jakarta.
 */
export function fromDatetimeLocalValue(value: string): string {
  if (!value) {
    return "";
  }

  const withSeconds = value.length === 16 ? `${value}:00` : value;

  return `${withSeconds}+07:00`;
}

export function formatEventDateRange(startAt: string, endAt: string, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone || undefined,
  };

  const start = new Intl.DateTimeFormat("id-ID", options).format(new Date(startAt));
  const end = new Intl.DateTimeFormat("id-ID", options).format(new Date(endAt));

  return `${start} – ${end}`;
}

export function formatSalesPeriod(start: string | null, end: string | null): string {
  if (!start && !end) {
    return "Selalu buka";
  }

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );

  if (start && end) {
    return `${fmt(start)} – ${fmt(end)}`;
  }

  if (start) {
    return `Mulai ${fmt(start)}`;
  }

  return `Hingga ${fmt(end!)}`;
}

export function formatEventDateShort(startAt: string, timezone?: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || undefined,
  }).format(new Date(startAt));
}

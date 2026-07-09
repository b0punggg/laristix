import { downloadCsv } from "@/lib/export-csv";
import type { EventAttendee } from "@/types/organizer";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Ya" : "Tidak";
  }

  return String(value);
}

function formatGender(value: string | null): string {
  if (!value) {
    return "";
  }

  if (value === "male") {
    return "Laki-laki";
  }

  if (value === "female") {
    return "Perempuan";
  }

  return value;
}

export function exportEventAttendeesCsv(attendees: EventAttendee[], eventTitle: string) {
  const customLabels = Array.from(
    new Set(
      attendees.flatMap((attendee) =>
        attendee.custom_answers.map((answer) => answer.label || answer.name),
      ),
    ),
  );

  const baseHeaders = [
    "No. order",
    "Status order",
    "Tanggal transaksi",
    "Pembeli",
    "Email pembeli",
    "Telepon pembeli",
    "KTP pembeli",
    "Tanggal lahir pembeli",
    "Jenis kelamin pembeli",
    "Nama peserta",
    "Email peserta",
    "Telepon peserta",
    "KTP peserta",
    "Tanggal lahir peserta",
    "Jenis kelamin peserta",
    "Tipe tiket",
    "Kode tiket",
    "Seat",
    "Status registrasi",
    "Check-in",
  ];

  const headers = [...baseHeaders, ...customLabels];
  const slug = slugify(eventTitle);

  downloadCsv(
    `data-pemesan-${slug}-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    attendees.map((attendee) => {
      const answerMap = Object.fromEntries(
        attendee.custom_answers.map((answer) => [
          answer.label || answer.name,
          formatAnswerValue(answer.value),
        ]),
      );

      const row: unknown[] = [
        attendee.order?.order_number ?? "",
        attendee.order?.status ?? "",
        attendee.order?.paid_at ?? attendee.order?.created_at ?? "",
        attendee.order?.buyer_name ?? "",
        attendee.order?.buyer_email ?? "",
        attendee.order?.buyer_phone ?? "",
        attendee.order?.buyer_id_number ?? "",
        attendee.order?.buyer_date_of_birth ?? "",
        formatGender(attendee.order?.buyer_gender ?? null),
        attendee.attendee_name ?? "",
        attendee.attendee_email ?? "",
        attendee.attendee_phone ?? "",
        attendee.id_number ?? "",
        attendee.date_of_birth ?? "",
        formatGender(attendee.gender),
        attendee.ticket_type_name ?? "",
        attendee.ticket_code ?? "",
        attendee.seat_index,
        attendee.status,
        attendee.checked_in_at ?? "",
      ];

      customLabels.forEach((label) => {
        row.push(answerMap[label] ?? "");
      });

      return row;
    }),
  );
}

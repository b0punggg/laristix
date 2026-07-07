"use client";

import { PublicEventSectionRow } from "@/components/features/public/public-event-section-row";
import { buildHomeUrl } from "@/lib/public-discovery-filters";

export function PublicHomeSections() {
  return (
    <div className="space-y-16 py-12 md:py-16">
      <PublicEventSectionRow
        title="Event Unggulan"
        subtitle="Pilihan terbaik yang sedang ditunggu-tunggu"
        viewAllHref={buildHomeUrl({ upcoming_days: 30 })}
        filters={{ upcoming_days: 30, per_page: 8, sort: "published_at" }}
      />
      <PublicEventSectionRow
        title="Sedang Tren"
        subtitle="Event paling banyak dicari minggu ini"
        viewAllHref={buildHomeUrl({ upcoming_days: 14, sort: "published_at" })}
        filters={{ upcoming_days: 14, per_page: 8, sort: "published_at" }}
      />
      <PublicEventSectionRow
        title="Segera Dimulai"
        subtitle="Jangan sampai kehabisan tiket"
        viewAllHref={buildHomeUrl({ upcoming_days: 7 })}
        filters={{ upcoming_days: 7, per_page: 8 }}
      />
    </div>
  );
}

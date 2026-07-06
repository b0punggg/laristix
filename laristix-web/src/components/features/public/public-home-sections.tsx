"use client";

import { PublicEventSectionRow } from "@/components/features/public/public-event-section-row";
import { buildHomeUrl } from "@/lib/public-discovery-filters";

export function PublicHomeSections() {
  return (
    <div className="storefront-section mx-auto max-w-7xl space-y-12 px-4">
      <PublicEventSectionRow
        title="Sedang hangat"
        subtitle="Event populer yang segera dimulai"
        viewAllHref={buildHomeUrl({ upcoming_days: 14 })}
        filters={{ upcoming_days: 14, per_page: 8 }}
      />
      <PublicEventSectionRow
        title="Gratis"
        subtitle="Acara tanpa biaya tiket"
        viewAllHref={buildHomeUrl({ is_free: true })}
        filters={{ is_free: true, per_page: 8 }}
      />
      <PublicEventSectionRow
        title="Minggu ini"
        subtitle="Jangan lewatkan event minggu ini"
        viewAllHref={buildHomeUrl({ upcoming_days: 7 })}
        filters={{ upcoming_days: 7, per_page: 8 }}
      />
    </div>
  );
}

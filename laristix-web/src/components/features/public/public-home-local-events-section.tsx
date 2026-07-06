"use client";

import { PublicEventSectionRow } from "@/components/features/public/public-event-section-row";
import { usePreferredCity } from "@/hooks/use-preferred-city";
import { buildHomeUrl } from "@/lib/public-discovery-filters";

interface PublicHomeLocalEventsSectionProps {
  hidden?: boolean;
}

export function PublicHomeLocalEventsSection({ hidden = false }: PublicHomeLocalEventsSectionProps) {
  const preferredCity = usePreferredCity();

  if (hidden || !preferredCity) {
    return null;
  }

  return (
    <PublicEventSectionRow
      title={`Event di ${preferredCity}`}
      subtitle="Berdasarkan kota pilihan atau pembelian terakhir Anda"
      viewAllHref={buildHomeUrl({ city: preferredCity })}
      filters={{ city: preferredCity, per_page: 8 }}
    />
  );
}

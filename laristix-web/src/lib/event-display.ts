import type { CheckoutOrderEventVenue } from "@/types/checkout";

export function formatVenueLabel(venue: CheckoutOrderEventVenue | null | undefined): string | null {
  if (!venue) {
    return null;
  }

  const parts = [venue.name, venue.city, venue.province].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

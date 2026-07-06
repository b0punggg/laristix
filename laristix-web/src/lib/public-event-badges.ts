import type { Event } from "@/types/event";

const NEW_EVENT_DAYS = 7;
const ALMOST_SOLD_THRESHOLD = 10;

export function isNewEvent(event: Event): boolean {
  if (!event.published_at) {
    return false;
  }

  const publishedAt = new Date(event.published_at);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_EVENT_DAYS);

  return publishedAt >= cutoff;
}

export function isAlmostSoldOut(event: Event): boolean {
  if (event.tickets_remaining === undefined || event.tickets_remaining === null) {
    return false;
  }

  return event.tickets_remaining > 0 && event.tickets_remaining <= ALMOST_SOLD_THRESHOLD;
}

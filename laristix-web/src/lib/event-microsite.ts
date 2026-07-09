import type {
  EventFaqItem,
  EventGalleryItem,
  EventScheduleItem,
  EventSpeakerItem,
} from "@/lib/event-page-content";
import { parseEventPageContent } from "@/lib/event-page-content";
import type { Event } from "@/types/event";

export interface EventMicrositeSettings {
  gallery: EventGalleryItem[];
  faq: EventFaqItem[];
  speakers: EventSpeakerItem[];
  schedule: EventScheduleItem[];
}

export function parseEventMicrositeSettings(
  settings: Record<string, unknown> | null,
): EventMicrositeSettings {
  const content = parseEventPageContent({ settings } as Event);

  return {
    gallery: content.gallery,
    faq: content.faq,
    speakers: content.speakers,
    schedule: content.schedule,
  };
}

export function applyMicrositeSettings(
  settings: Record<string, unknown>,
  microsite: EventMicrositeSettings,
): Record<string, unknown> {
  const next = { ...settings };

  const gallery = microsite.gallery
    .filter((item) => item.url.trim())
    .map((item) => ({
      url: item.url.trim(),
      ...(item.alt?.trim() ? { alt: item.alt.trim() } : {}),
    }));

  if (gallery.length > 0) {
    next.gallery = gallery;
  } else {
    delete next.gallery;
  }

  const faq = microsite.faq.filter((item) => item.question.trim() && item.answer.trim());
  if (faq.length > 0) {
    next.faq = faq;
  } else {
    delete next.faq;
  }

  const speakers = microsite.speakers
    .filter((item) => item.name.trim())
    .map((item) => ({
      name: item.name.trim(),
      ...(item.title?.trim() ? { title: item.title.trim() } : {}),
      ...(item.bio?.trim() ? { bio: item.bio.trim() } : {}),
      ...(item.photo_url?.trim() ? { photo_url: item.photo_url.trim() } : {}),
    }));

  if (speakers.length > 0) {
    next.speakers = speakers;
  } else {
    delete next.speakers;
  }

  const schedule = microsite.schedule
    .filter((item) => item.title.trim())
    .map((item) => ({
      title: item.title.trim(),
      ...(item.description?.trim() ? { description: item.description.trim() } : {}),
      ...(item.start_at?.trim() ? { start_at: item.start_at.trim() } : {}),
      ...(item.end_at?.trim() ? { end_at: item.end_at.trim() } : {}),
    }));

  if (schedule.length > 0) {
    next.schedule = schedule;
  } else {
    delete next.schedule;
  }

  return next;
}

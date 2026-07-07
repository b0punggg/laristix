import type { Event, EventVenue } from "@/types/event";

export interface EventGalleryItem {
  url: string;
  alt?: string;
}

export interface EventFaqItem {
  question: string;
  answer: string;
}

export interface EventSpeakerItem {
  name: string;
  title?: string;
  bio?: string;
  photo_url?: string;
}

export interface EventScheduleItem {
  title: string;
  description?: string;
  start_at?: string;
  end_at?: string;
}

export interface EventPageContent {
  gallery: EventGalleryItem[];
  faq: EventFaqItem[];
  speakers: EventSpeakerItem[];
  schedule: EventScheduleItem[];
  terms: string | null;
}

type VenueWithCoords = EventVenue & {
  latitude?: number | null;
  longitude?: number | null;
  province?: string | null;
  online_url?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseGalleryItems(settings: Record<string, unknown> | null): EventGalleryItem[] {
  const gallery = asArray(settings?.gallery)
    .map((item) => {
      const record = asRecord(item);
      const url = asString(record?.url);
      if (!url) {
        return null;
      }

      const alt = asString(record?.alt);
      return alt ? { url, alt } : { url };
    })
    .filter((item): item is EventGalleryItem => item !== null);

  const media = asArray(settings?.media)
    .map((item) => {
      const record = asRecord(item);
      const url = asString(record?.url);
      if (!url) {
        return null;
      }

      const alt = asString(record?.alt_text) ?? asString(record?.alt);
      return alt ? { url, alt } : { url };
    })
    .filter((item): item is EventGalleryItem => item !== null);

  return [...gallery, ...media];
}

function parseFaqItems(settings: Record<string, unknown> | null): EventFaqItem[] {
  return asArray(settings?.faq)
    .map((item) => {
      const record = asRecord(item);
      const question = asString(record?.question);
      const answer = asString(record?.answer);
      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter((item): item is EventFaqItem => item !== null);
}

function parseSpeakerItems(settings: Record<string, unknown> | null): EventSpeakerItem[] {
  const items: EventSpeakerItem[] = [];

  for (const item of asArray(settings?.speakers)) {
    const record = asRecord(item);
    const name = asString(record?.name);
    if (!name) {
      continue;
    }

    items.push({
      name,
      title: asString(record?.title) ?? asString(record?.role),
      bio: asString(record?.bio) ?? asString(record?.description),
      photo_url: asString(record?.photo_url) ?? asString(record?.image_url),
    });
  }

  return items;
}

function parseScheduleItems(settings: Record<string, unknown> | null): EventScheduleItem[] {
  const items: EventScheduleItem[] = [];

  for (const item of asArray(settings?.schedule)) {
    const record = asRecord(item);
    const title = asString(record?.title);
    if (!title) {
      continue;
    }

    items.push({
      title,
      description: asString(record?.description),
      start_at: asString(record?.start_at),
      end_at: asString(record?.end_at),
    });
  }

  return items;
}

export function parseEventPageContent(event: Event): EventPageContent {
  const settings = asRecord(event.settings);

  return {
    gallery: parseGalleryItems(settings),
    faq: parseFaqItems(settings),
    speakers: parseSpeakerItems(settings),
    schedule: parseScheduleItems(settings),
    terms: asString(settings?.terms) ?? null,
  };
}

export function buildEventGallery(event: Event, content: EventPageContent): EventGalleryItem[] {
  const items = [...content.gallery];

  if (event.banner_url && !items.some((item) => item.url === event.banner_url)) {
    items.unshift({ url: event.banner_url, alt: event.title });
  }

  return items;
}

export function formatVenueAddress(venue: EventVenue | null | undefined): string | null {
  if (!venue) {
    return null;
  }

  const extended = venue as VenueWithCoords;
  const parts = [extended.name, extended.address, extended.city, extended.province].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export function getVenueMapEmbedUrl(venue: EventVenue | null | undefined): string | null {
  if (!venue) {
    return null;
  }

  const extended = venue as VenueWithCoords;

  if (extended.latitude != null && extended.longitude != null) {
    return `https://maps.google.com/maps?q=${extended.latitude},${extended.longitude}&z=15&output=embed`;
  }

  const query = formatVenueAddress(venue);
  if (!query) {
    return null;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export function getVenueMapLink(venue: EventVenue | null | undefined): string | null {
  if (!venue) {
    return null;
  }

  const extended = venue as VenueWithCoords;

  if (extended.latitude != null && extended.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${extended.latitude},${extended.longitude}`;
  }

  const query = formatVenueAddress(venue);
  if (!query) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function isOnlineVenue(venue: EventVenue | null | undefined): boolean {
  if (!venue) {
    return false;
  }

  const extended = venue as VenueWithCoords;
  return venue.type === "online" || Boolean(extended.online_url);
}

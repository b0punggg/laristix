import type { EventMicrositeSettings } from "@/lib/event-microsite";
import { applyMicrositeSettings } from "@/lib/event-microsite";
import type { EventCheckoutSettings } from "@/lib/event-checkout-settings";
import { applyCheckoutSettings } from "@/lib/event-checkout-settings";

export interface EventContactSettings {
  name: string;
  email: string;
  phone?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function parseEventTerms(settings: Record<string, unknown> | null): string {
  return asString(settings?.terms) ?? "";
}

export function parseEventContact(settings: Record<string, unknown> | null): EventContactSettings {
  const contact = asRecord(settings?.contact);

  return {
    name: asString(contact?.name) ?? "",
    email: asString(contact?.email) ?? "",
    phone: asString(contact?.phone) ?? "",
  };
}

export function buildEventSettings(
  existing: Record<string, unknown> | null,
  patch: {
    terms?: string;
    contact?: EventContactSettings;
    microsite?: EventMicrositeSettings;
    checkout?: EventCheckoutSettings;
  },
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...(existing ?? {}) };

  if (patch.terms !== undefined) {
    const trimmed = patch.terms.trim();
    if (trimmed) {
      next.terms = trimmed;
    } else {
      delete next.terms;
    }
  }

  if (patch.contact) {
    const contact = {
      name: patch.contact.name.trim(),
      email: patch.contact.email.trim(),
      ...(patch.contact.phone?.trim() ? { phone: patch.contact.phone.trim() } : {}),
    };

    if (contact.name && contact.email) {
      next.contact = contact;
    } else {
      delete next.contact;
    }
  }

  if (patch.microsite) {
    return applyMicrositeSettings(next, patch.microsite);
  }

  if (patch.checkout) {
    return applyCheckoutSettings(next, patch.checkout);
  }

  return next;
}

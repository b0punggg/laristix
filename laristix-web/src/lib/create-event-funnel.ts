import { routes } from "@/config/env";
import { createEventOnboardingTarget } from "@/lib/public-create-event-data";

export function encodeRedirectPath(path: string): string {
  return encodeURIComponent(path);
}

export function buildSelectOrganizerFunnelHref(target = createEventOnboardingTarget): string {
  return `${routes.selectOrganizer}?redirect=${encodeRedirectPath(target)}`;
}

export function buildCreateOrganizerFunnelHref(target = createEventOnboardingTarget): string {
  return `${routes.createOrganizer}?next=${encodeRedirectPath(target)}`;
}

/**
 * Resolves the next href for "Buat Event" CTAs based on auth / organizer state.
 */
export function buildCreateEventFunnelHref(options: {
  isAuthenticated: boolean;
  hasActiveOrganizer: boolean;
}): string {
  const target = createEventOnboardingTarget;

  if (!options.isAuthenticated) {
    return routes.loginWithRedirect(buildSelectOrganizerFunnelHref(target));
  }

  if (!options.hasActiveOrganizer) {
    return buildSelectOrganizerFunnelHref(target);
  }

  return target;
}

export function readRedirectSearchParam(
  searchParams: Pick<URLSearchParams, "get">,
  keys: string[] = ["redirect", "next"],
): string | null {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value && value.startsWith("/") && !value.startsWith("//")) {
      return value;
    }
  }

  return null;
}

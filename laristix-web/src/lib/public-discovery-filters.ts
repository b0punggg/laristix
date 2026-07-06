import { routes } from "@/config/env";
import { parsePublicEventSort, type PublicEventSort } from "@/lib/public-discovery-sort";

export interface PublicDiscoveryFilters {
  q?: string;
  category_id?: number;
  city?: string;
  is_free?: boolean;
  upcoming_days?: number;
  sort?: PublicEventSort;
}

export function parsePublicDiscoveryFilters(searchParams: URLSearchParams): PublicDiscoveryFilters {
  const q = searchParams.get("q")?.trim() || undefined;
  const categoryRaw = searchParams.get("category_id");
  const category_id = categoryRaw ? Number(categoryRaw) : undefined;
  const city = searchParams.get("city")?.trim() || undefined;
  const isFreeRaw = searchParams.get("is_free");
  const upcomingDaysRaw = searchParams.get("upcoming_days");
  const sort = parsePublicEventSort(searchParams.get("sort"));

  let is_free: boolean | undefined;
  if (isFreeRaw === "1" || isFreeRaw === "true") {
    is_free = true;
  }

  let upcoming_days: number | undefined;
  if (upcomingDaysRaw) {
    const parsed = Number(upcomingDaysRaw);
    upcoming_days = !Number.isNaN(parsed) && parsed > 0 ? parsed : undefined;
  }

  return {
    q,
    category_id: category_id && !Number.isNaN(category_id) ? category_id : undefined,
    city,
    is_free,
    upcoming_days,
    sort: sort === "start_at" ? undefined : sort,
  };
}

export function buildPublicDiscoveryQuery(filters: PublicDiscoveryFilters): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.category_id) {
    params.set("category_id", String(filters.category_id));
  }

  if (filters.city) {
    params.set("city", filters.city);
  }

  if (filters.is_free) {
    params.set("is_free", "1");
  }

  if (filters.upcoming_days) {
    params.set("upcoming_days", String(filters.upcoming_days));
  }

  if (filters.sort && filters.sort !== "start_at") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function buildHomeUrl(filters: PublicDiscoveryFilters = {}): string {
  return `${routes.home}${buildPublicDiscoveryQuery(filters)}`;
}

export function hasActiveDiscoveryFilters(filters: PublicDiscoveryFilters): boolean {
  return Boolean(
    filters.q || filters.category_id || filters.city || filters.is_free || filters.upcoming_days,
  );
}

export function discoveryFiltersToEventList(
  filters: PublicDiscoveryFilters,
  extra: { per_page?: number; page?: number } = {},
) {
  return {
    search: filters.q,
    category_id: filters.category_id,
    city: filters.city,
    is_free: filters.is_free,
    upcoming_days: filters.upcoming_days,
    sort: filters.sort ?? "start_at",
    ...extra,
  };
}

export function getSectionFilterLabel(filters: PublicDiscoveryFilters): string | null {
  if (filters.is_free) {
    return "Event gratis";
  }

  if (filters.upcoming_days === 7) {
    return "Minggu ini";
  }

  if (filters.upcoming_days === 14) {
    return "Sedang hangat";
  }

  if (filters.upcoming_days) {
    return `${filters.upcoming_days} hari ke depan`;
  }

  return null;
}

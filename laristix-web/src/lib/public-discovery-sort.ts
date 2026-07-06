export type PublicEventSort = "start_at" | "published_at" | "title";

export interface PublicSortOption {
  value: PublicEventSort;
  label: string;
}

export const PUBLIC_EVENT_SORT_OPTIONS: PublicSortOption[] = [
  { value: "start_at", label: "Terdekat waktu" },
  { value: "published_at", label: "Terbaru" },
  { value: "title", label: "A–Z" },
];

export function parsePublicEventSort(value: string | null | undefined): PublicEventSort {
  if (value === "published_at" || value === "title") {
    return value;
  }

  return "start_at";
}

export function getPublicEventSortLabel(sort: PublicEventSort): string {
  return PUBLIC_EVENT_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Terdekat waktu";
}

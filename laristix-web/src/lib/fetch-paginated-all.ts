import type { PaginatedMeta, PaginatedResponse } from "@/types/event";

const DEFAULT_PER_PAGE = 100;

export async function fetchAllPaginated<T>(
  fetchPage: (page: number, perPage: number) => Promise<PaginatedResponse<T>>,
  perPage = DEFAULT_PER_PAGE,
): Promise<T[]> {
  const firstPage = await fetchPage(1, perPage);
  const items = [...firstPage.data];

  for (let page = 2; page <= firstPage.meta.last_page; page++) {
    const response = await fetchPage(page, perPage);
    items.push(...response.data);
  }

  return items;
}

export function paginatedMetaTotal(meta: PaginatedMeta | undefined): number {
  return meta?.total ?? 0;
}

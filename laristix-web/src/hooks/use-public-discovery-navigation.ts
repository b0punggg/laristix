"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  buildHomeUrl,
  parsePublicDiscoveryFilters,
  type PublicDiscoveryFilters,
} from "@/lib/public-discovery-filters";
import { setPreferredCity } from "@/lib/preferred-city";
import { parsePublicEventSort, type PublicEventSort } from "@/lib/public-discovery-sort";

export function usePublicDiscoveryNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parsePublicDiscoveryFilters(searchParams),
    [searchParams],
  );

  const navigate = useCallback(
    (next: PublicDiscoveryFilters) => {
      router.replace(buildHomeUrl(next));
    },
    [router],
  );

  const toggleCategory = useCallback(
    (categoryId: number) => {
      navigate({
        ...filters,
        category_id: filters.category_id === categoryId ? undefined : categoryId,
      });
    },
    [filters, navigate],
  );

  const toggleCity = useCallback(
    (city: string) => {
      const nextCity = filters.city === city ? undefined : city;
      if (nextCity) {
        setPreferredCity(nextCity);
      }
      navigate({
        ...filters,
        city: nextCity,
      });
    },
    [filters, navigate],
  );

  const setSort = useCallback(
    (sort: PublicEventSort) => {
      navigate({
        ...filters,
        sort: sort === "start_at" ? undefined : sort,
      });
    },
    [filters, navigate],
  );

  const clearFilters = useCallback(() => {
    router.replace(buildHomeUrl());
  }, [router]);

  const sort = parsePublicEventSort(filters.sort);

  return {
    filters,
    sort,
    navigate,
    toggleCategory,
    toggleCity,
    setSort,
    clearFilters,
  };
}

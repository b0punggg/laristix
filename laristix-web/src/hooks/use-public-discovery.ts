"use client";

import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/services/event/event-api";

export const publicDiscoveryKeys = {
  categories: ["public-discovery", "categories"] as const,
  cities: ["public-discovery", "cities"] as const,
};

export function usePublicCategoriesQuery() {
  return useQuery({
    queryKey: publicDiscoveryKeys.categories,
    queryFn: () => eventApi.listPublicCategories(),
    staleTime: 5 * 60_000,
  });
}

export function usePublicCitiesQuery() {
  return useQuery({
    queryKey: publicDiscoveryKeys.cities,
    queryFn: () => eventApi.listPublicCities(),
    staleTime: 5 * 60_000,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/services/event/event-api";

export const publicPlatformKeys = {
  stats: ["public-platform", "stats"] as const,
  featuredOrganizers: ["public-platform", "featured-organizers"] as const,
};

export function usePublicPlatformStatsQuery() {
  return useQuery({
    queryKey: publicPlatformKeys.stats,
    queryFn: () => eventApi.getPublicStats(),
    staleTime: 10 * 60_000,
  });
}

export function useFeaturedOrganizersQuery() {
  return useQuery({
    queryKey: publicPlatformKeys.featuredOrganizers,
    queryFn: () => eventApi.listFeaturedOrganizers(),
    staleTime: 10 * 60_000,
  });
}

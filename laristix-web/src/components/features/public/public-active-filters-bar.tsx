"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { usePublicCategoriesQuery } from "@/hooks/use-public-discovery";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import {
  getSectionFilterLabel,
  hasActiveDiscoveryFilters,
} from "@/lib/public-discovery-filters";

export function PublicActiveFiltersBar() {
  const { filters, navigate, clearFilters } = usePublicDiscoveryNavigation();
  const categoriesQuery = usePublicCategoriesQuery();

  const categoryName = useMemo(
    () => categoriesQuery.data?.find((c) => c.id === filters.category_id)?.name,
    [categoriesQuery.data, filters.category_id],
  );

  if (!hasActiveDiscoveryFilters(filters)) {
    return null;
  }

  const sectionLabel = getSectionFilterLabel(filters);

  const clearCategory = () => navigate({ ...filters, category_id: undefined });
  const clearCity = () => navigate({ ...filters, city: undefined });
  const clearSearch = () => navigate({ ...filters, q: undefined });
  const clearSection = () =>
    navigate({
      ...filters,
      is_free: undefined,
      upcoming_days: undefined,
    });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Filter aktif:</span>
      {filters.q ? (
        <Button variant="secondary" size="sm" className="h-7 gap-1 text-xs" onClick={clearSearch}>
          &ldquo;{filters.q}&rdquo;
          <X className="size-3" />
        </Button>
      ) : null}
      {filters.category_id && categoryName ? (
        <Button variant="secondary" size="sm" className="h-7 gap-1 text-xs" onClick={clearCategory}>
          {categoryName}
          <X className="size-3" />
        </Button>
      ) : null}
      {filters.city ? (
        <Button variant="secondary" size="sm" className="h-7 gap-1 text-xs" onClick={clearCity}>
          {filters.city}
          <X className="size-3" />
        </Button>
      ) : null}
      {sectionLabel ? (
        <Button variant="secondary" size="sm" className="h-7 gap-1 text-xs" onClick={clearSection}>
          {sectionLabel}
          <X className="size-3" />
        </Button>
      ) : null}
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
        Hapus semua
      </Button>
    </div>
  );
}

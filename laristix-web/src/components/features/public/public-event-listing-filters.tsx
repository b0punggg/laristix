"use client";

import { ArrowUpDown, Calendar, LayoutGrid, MapPin, Sparkles, Tag } from "lucide-react";
import { DiscoveryChip } from "@/components/features/public/discovery-chip";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/design-system/primitives/text";
import { usePublicCategoriesQuery, usePublicCitiesQuery } from "@/hooks/use-public-discovery";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { getCategoryIcon } from "@/lib/category-icons";
import { hasActiveDiscoveryFilters } from "@/lib/public-discovery-filters";
import { PUBLIC_EVENT_SORT_OPTIONS } from "@/lib/public-discovery-sort";
import { cn } from "@/lib/utils";

const DATE_FILTER_OPTIONS = [
  { label: "Semua tanggal", value: undefined },
  { label: "7 hari ke depan", value: 7 },
  { label: "14 hari ke depan", value: 14 },
  { label: "30 hari ke depan", value: 30 },
] as const;

interface FilterSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

function FilterSection({ title, icon: Icon, children, className }: FilterSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-brand" aria-hidden />
        <Text variant="overline" className="text-foreground">
          {title}
        </Text>
      </div>
      {children}
    </section>
  );
}

function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-24 rounded-full" />
      ))}
    </div>
  );
}

export interface PublicEventListingFiltersProps {
  className?: string;
  showSort?: boolean;
  compact?: boolean;
}

export function PublicEventListingFilters({
  className,
  showSort = true,
  compact = false,
}: PublicEventListingFiltersProps) {
  const { filters, navigate, toggleCategory, toggleCity, setSort, sort, clearFilters } =
    usePublicDiscoveryNavigation();
  const categoriesQuery = usePublicCategoriesQuery();
  const citiesQuery = usePublicCitiesQuery();

  const setDateFilter = (days: number | undefined) => {
    navigate({
      ...filters,
      upcoming_days: days,
    });
  };

  const toggleFreeOnly = () => {
    navigate({
      ...filters,
      is_free: filters.is_free ? undefined : true,
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <FilterSection title="Kategori" icon={LayoutGrid}>
        {categoriesQuery.isLoading ? (
          <CategoryFilterSkeleton />
        ) : categoriesQuery.isError ? (
          <p className="text-sm text-muted-foreground">Gagal memuat kategori.</p>
        ) : compact ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
            <DiscoveryChip
              label="Semua"
              icon={LayoutGrid}
              active={!filters.category_id}
              onClick={() => navigate({ ...filters, category_id: undefined })}
            />
            {(categoriesQuery.data ?? []).map((category) => (
              <DiscoveryChip
                key={category.id}
                label={category.name}
                icon={getCategoryIcon(category.icon)}
                active={filters.category_id === category.id}
                badge={category.events_count}
                onClick={() => toggleCategory(category.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate({ ...filters, category_id: undefined })}
              className={cn(
                "ds-focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                !filters.category_id
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border bg-card text-foreground hover:border-brand/40",
              )}
            >
              Semua
            </button>
            {(categoriesQuery.data ?? []).map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "ds-focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  filters.category_id === category.id
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-border bg-card text-foreground hover:border-brand/40",
                )}
              >
                {category.name}
                {(category.events_count ?? 0) > 0 ? (
                  <span className="ml-1 text-muted-foreground">({category.events_count})</span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Lokasi" icon={MapPin}>
        {citiesQuery.isLoading ? (
          <Skeleton className="h-10 w-full rounded-lg" />
        ) : (citiesQuery.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data kota.</p>
        ) : (
          <Select
            value={filters.city ?? ""}
            onChange={(event) => {
              const city = event.target.value || undefined;
              navigate({ ...filters, city });
            }}
            className="h-10 w-full"
            aria-label="Filter kota"
          >
            <option value="">Semua kota</option>
            {(citiesQuery.data ?? []).map((item) => (
              <option key={item.city} value={item.city}>
                {item.city} ({item.events_count})
              </option>
            ))}
          </Select>
        )}
      </FilterSection>

      <FilterSection title="Tanggal" icon={Calendar}>
        <div className="grid grid-cols-2 gap-2">
          {DATE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setDateFilter(option.value)}
              className={cn(
                "ds-focus-ring rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                filters.upcoming_days === option.value ||
                  (!filters.upcoming_days && option.value === undefined)
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border bg-card text-foreground hover:border-brand/40",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Harga" icon={Tag}>
        <button
          type="button"
          onClick={toggleFreeOnly}
          aria-pressed={Boolean(filters.is_free)}
          className={cn(
            "ds-focus-ring flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
            filters.is_free
              ? "border-brand bg-brand-muted text-brand"
              : "border-border bg-card text-foreground hover:border-brand/40",
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="size-4" aria-hidden />
            Event gratis saja
          </span>
          <span
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              filters.is_free ? "bg-brand" : "bg-muted",
            )}
            aria-hidden
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
                filters.is_free ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </span>
        </button>
      </FilterSection>

      {showSort ? (
        <FilterSection title="Urutkan" icon={ArrowUpDown}>
          <Select
            id="listing-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-10 w-full"
            aria-label="Urutkan event"
          >
            {PUBLIC_EVENT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterSection>
      ) : null}

      {hasActiveDiscoveryFilters(filters) ? (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Hapus semua filter
        </Button>
      ) : null}
    </div>
  );
}

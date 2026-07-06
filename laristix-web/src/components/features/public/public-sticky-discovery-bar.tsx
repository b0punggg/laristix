"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { usePublicCategoriesQuery, usePublicCitiesQuery } from "@/hooks/use-public-discovery";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { getCategoryIcon } from "@/lib/category-icons";
import { hasActiveDiscoveryFilters } from "@/lib/public-discovery-filters";
import { PUBLIC_EVENT_SORT_OPTIONS } from "@/lib/public-discovery-sort";
import { cn } from "@/lib/utils";
import { DiscoveryChip } from "./discovery-chip";

interface PublicDiscoveryFilterSheetProps {
  open: boolean;
  onClose: () => void;
}

export function PublicDiscoveryFilterSheet({ open, onClose }: PublicDiscoveryFilterSheetProps) {
  const { filters, navigate, toggleCategory, toggleCity, clearFilters } = usePublicDiscoveryNavigation();
  const categoriesQuery = usePublicCategoriesQuery();
  const citiesQuery = usePublicCitiesQuery();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Tutup filter"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">Filter event</h2>
          <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
            <X className="size-4" />
            <span className="sr-only">Tutup</span>
          </Button>
        </div>

        <div className="space-y-6 overflow-y-auto px-4 py-4 pb-8">
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Kategori</h3>
            <div className="flex flex-wrap gap-2">
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
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Kota</h3>
            {(citiesQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data kota.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <DiscoveryChip
                  label="Semua kota"
                  icon={MapPin}
                  active={!filters.city}
                  onClick={() => navigate({ ...filters, city: undefined })}
                />
                {(citiesQuery.data ?? []).map((item) => (
                  <DiscoveryChip
                    key={item.city}
                    label={item.city}
                    icon={MapPin}
                    active={filters.city === item.city}
                    badge={item.events_count}
                    onClick={() => toggleCity(item.city)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex gap-2 border-t bg-white px-4 py-3">
          {hasActiveDiscoveryFilters(filters) ? (
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Reset
            </Button>
          ) : null}
          <Button className="flex-1 bg-brand hover:bg-brand-hover" onClick={onClose}>
            Terapkan
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PublicStickyDiscoveryBarProps {
  visible: boolean;
}

export function PublicStickyDiscoveryBar({ visible }: PublicStickyDiscoveryBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { filters, sort, setSort } = usePublicDiscoveryNavigation();
  const categoriesQuery = usePublicCategoriesQuery();
  const activeCategory = categoriesQuery.data?.find((c) => c.id === filters.category_id);

  const activeFilterCount = [
    filters.category_id,
    filters.city,
    filters.is_free,
    filters.upcoming_days,
  ].filter(Boolean).length;

  return (
    <>
      <div
        className={cn(
          "sticky z-40 border-b bg-white/95 backdrop-blur transition-all duration-200 top-[116px] lg:top-[73px]",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
        aria-hidden={!visible}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 md:hidden"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="size-4" />
            Filter
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>

          <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
            {activeCategory ? (
              <span className="truncate rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {activeCategory.name}
              </span>
            ) : null}
            {filters.city ? (
              <span className="truncate rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {filters.city}
              </span>
            ) : null}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <label htmlFor="event-sort" className="sr-only">
              Urutkan
            </label>
            <Select
              id="event-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="h-9 w-[148px] text-xs sm:w-auto sm:text-sm"
              aria-label="Urutkan event"
            >
              {PUBLIC_EVENT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <PublicDiscoveryFilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

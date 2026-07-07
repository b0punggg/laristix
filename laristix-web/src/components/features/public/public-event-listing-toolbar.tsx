"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import {
  PublicEventListingFilterTrigger,
  PublicEventListingMobileDrawer,
} from "@/components/features/public/public-event-listing-mobile-drawer";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Text } from "@/design-system/primitives/text";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { PUBLIC_EVENT_SORT_OPTIONS } from "@/lib/public-discovery-sort";
import { cn } from "@/lib/utils";

interface PublicEventListingToolbarProps {
  total?: number;
  loadedCount?: number;
  isLoading?: boolean;
  className?: string;
  sticky?: boolean;
}

export function PublicEventListingToolbar({
  total,
  loadedCount,
  isLoading,
  className,
  sticky = false,
}: PublicEventListingToolbarProps) {
  const { filters, navigate, setSort, sort } = usePublicDiscoveryNavigation();
  const [query, setQuery] = useState(filters.q ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeFilterCount = [
    filters.category_id,
    filters.city,
    filters.is_free,
    filters.upcoming_days,
  ].filter(Boolean).length;

  const handleSearch = (value: string) => {
    navigate({
      ...filters,
      q: value.trim() || undefined,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    navigate({ ...filters, q: undefined });
  };

  return (
    <>
      <div
        className={cn(
          "space-y-4",
          sticky && "sticky top-[116px] z-30 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur lg:top-[73px] lg:mx-0 lg:rounded-xl lg:border lg:px-5",
          className,
        )}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari konser, festival, workshop..."
              className="h-11 pr-10"
              aria-label="Cari event"
            />
            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                className="ds-focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Hapus pencarian"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <Button type="submit" className="hidden h-11 shrink-0 bg-brand hover:bg-brand-hover sm:flex">
            <Search className="size-4" aria-hidden />
            Cari
          </Button>
        </form>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <PublicEventListingFilterTrigger
              onClick={() => setDrawerOpen(true)}
              activeCount={activeFilterCount}
            />
            {!isLoading && total !== undefined ? (
              <Text variant="caption" className="truncate">
                {loadedCount !== undefined && loadedCount < total
                  ? `${loadedCount} dari ${total} event`
                  : `${total} event`}
              </Text>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label htmlFor="listing-sort-toolbar" className="sr-only">
              Urutkan
            </label>
            <Select
              id="listing-sort-toolbar"
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="h-9 w-[140px] text-xs sm:w-auto sm:text-sm"
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

      <PublicEventListingMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

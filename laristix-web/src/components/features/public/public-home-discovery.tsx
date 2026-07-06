"use client";

import { LayoutGrid, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoveryChip } from "@/components/features/public/discovery-chip";
import { usePublicCategoriesQuery, usePublicCitiesQuery } from "@/hooks/use-public-discovery";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { getCategoryIcon } from "@/lib/category-icons";

function ChipRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-20 shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

export function PublicHomeDiscovery() {
  const { filters, navigate, toggleCategory, toggleCity } = usePublicDiscoveryNavigation();
  const categoriesQuery = usePublicCategoriesQuery();
  const citiesQuery = usePublicCitiesQuery();

  return (
    <div id="discovery" className="storefront-section mx-auto max-w-7xl space-y-10 px-4">
      <section className="space-y-4" aria-labelledby="discovery-categories-heading">
        <h2 id="discovery-categories-heading" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          Jelajahi Kategori
        </h2>
        {categoriesQuery.isLoading ? (
          <ChipRowSkeleton />
        ) : categoriesQuery.isError ? (
          <p className="text-sm text-muted-foreground">Gagal memuat kategori.</p>
        ) : (
          <div
            className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-thin"
            role="group"
            aria-label="Filter kategori event"
          >
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
        )}
      </section>

      <section className="space-y-4" aria-labelledby="discovery-cities-heading">
        <h2 id="discovery-cities-heading" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          Event di Kota
        </h2>
        {citiesQuery.isLoading ? (
          <ChipRowSkeleton />
        ) : citiesQuery.isError ? (
          <p className="text-sm text-muted-foreground">Gagal memuat kota.</p>
        ) : (citiesQuery.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada event dengan lokasi kota. Event akan muncul setelah venue diisi.
          </p>
        ) : (
          <div
            className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-thin"
            role="group"
            aria-label="Filter kota event"
          >
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
  );
}

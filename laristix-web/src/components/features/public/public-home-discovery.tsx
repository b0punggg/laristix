"use client";

import { LayoutGrid, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoveryChip } from "@/components/features/public/discovery-chip";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { usePublicCategoriesQuery, usePublicCitiesQuery } from "@/hooks/use-public-discovery";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { getCategoryIcon } from "@/lib/category-icons";

function ChipRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-24 shrink-0 rounded-2xl" />
      ))}
    </div>
  );
}

export function PublicHomeDiscovery() {
  const { filters, navigate, toggleCategory, toggleCity } = usePublicDiscoveryNavigation();
  const categoriesQuery = usePublicCategoriesQuery();
  const citiesQuery = usePublicCitiesQuery();

  return (
    <section id="discovery" className="bg-surface py-12 md:py-16">
      <Container className="space-y-12">
        <section className="space-y-5" aria-labelledby="discovery-categories-heading">
          <div>
            <Text variant="h2" id="discovery-categories-heading">
              Kategori Populer
            </Text>
            <Text variant="caption" className="mt-1">
              Temukan event sesuai minatmu
            </Text>
          </div>
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

        <section className="space-y-5" aria-labelledby="discovery-cities-heading">
          <div>
            <Text variant="h2" id="discovery-cities-heading">
              Kota Populer
            </Text>
            <Text variant="caption" className="mt-1">
              Event terdekat di kotamu
            </Text>
          </div>
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
      </Container>
    </section>
  );
}

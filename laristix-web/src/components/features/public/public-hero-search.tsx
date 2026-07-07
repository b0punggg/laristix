"use client";

import { useState } from "react";
import { usePublicCategoriesQuery, usePublicCitiesQuery } from "@/hooks/use-public-discovery";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PublicHeroSearchProps {
  className?: string;
  variant?: "hero" | "compact";
}

export function PublicHeroSearch({ className, variant = "hero" }: PublicHeroSearchProps) {
  const { filters, navigate } = usePublicDiscoveryNavigation();
  const categoriesQuery = usePublicCategoriesQuery();
  const citiesQuery = usePublicCitiesQuery();

  const [query, setQuery] = useState(filters.q ?? "");
  const [categoryId, setCategoryId] = useState(
    filters.category_id ? String(filters.category_id) : "",
  );
  const [city, setCity] = useState(filters.city ?? "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({
      ...filters,
      q: query.trim() || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      city: city || undefined,
    });
  };

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full",
        isHero
          ? "rounded-2xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md sm:p-4"
          : "rounded-xl border bg-card p-3 shadow-sm",
        className,
      )}
    >
      <div className={cn("grid gap-3", isHero ? "lg:grid-cols-[1fr_auto_auto_auto]" : "sm:grid-cols-2 lg:grid-cols-4")}>
        <div className={cn("relative", isHero ? "lg:col-span-1" : "sm:col-span-2 lg:col-span-1")}>
          <Search
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2",
              isHero ? "text-white/60" : "text-muted-foreground",
            )}
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari konser, festival, workshop..."
            className={cn(
              "h-12 pl-10",
              isHero && "border-white/20 bg-white/95 placeholder:text-muted-foreground",
            )}
          />
        </div>

        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={cn("h-12", isHero && "border-white/20 bg-white/95")}
          aria-label="Kategori event"
        >
          <option value="">Semua kategori</option>
          {(categoriesQuery.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={cn("h-12", isHero && "border-white/20 bg-white/95")}
          aria-label="Kota"
        >
          <option value="">Semua kota</option>
          {(citiesQuery.data ?? []).map((item) => (
            <option key={item.city} value={item.city}>
              {item.city}
            </option>
          ))}
        </Select>

        <Button
          type="submit"
          size="lg"
          className={cn(
            "h-12 w-full",
            isHero && "bg-white text-brand hover:bg-brand-muted",
          )}
        >
          <Search className="size-4" aria-hidden />
          Cari Event
        </Button>
      </div>
    </form>
  );
}

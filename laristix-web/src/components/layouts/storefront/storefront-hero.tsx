"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/env";
import { usePublicEventsPageQuery } from "@/hooks/use-public-events";
import { getCategoryGradient } from "@/lib/category-gradients";
import { formatEventDateShort } from "@/lib/datetime";

export function StorefrontHero() {
  const featuredQuery = usePublicEventsPageQuery({ upcoming_days: 14, per_page: 1 });
  const featured = featuredQuery.data?.data[0];

  return (
    <section className="storefront-section mx-auto max-w-7xl px-4 pt-8 md:pt-12">
      <div className="storefront-brand-gradient overflow-hidden rounded-2xl text-white shadow-lg">
        <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center md:p-10 lg:p-12">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden />
              Platform tiket event Indonesia
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Temukan pengalaman terbaik di kotamu
            </h1>
            <p className="max-w-md text-sm text-white/80 sm:text-base">
              Konser, festival, workshop, dan ribuan acara menarik — pesan tiket dalam hitungan menit.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-brand hover:bg-brand-muted">
                <Link href={`${routes.home}?focus=search`}>
                  <Search className="size-4" aria-hidden />
                  Cari event
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={routes.createOrganizer}>
                  Buat event
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            {featuredQuery.isLoading ? (
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            ) : featured ? (
              <Link
                href={routes.publicEvent(featured.uuid)}
                className="storefront-focus-ring group block overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white/15"
                aria-label={`Event pilihan: ${featured.title}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {featured.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.banner_url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`flex h-full items-center justify-center bg-gradient-to-br ${getCategoryGradient(featured.category?.slug)}`}
                    >
                      <Calendar className="size-12 text-white/50" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                      Event pilihan
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug">
                      {featured.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/80">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" aria-hidden />
                        {formatEventDateShort(featured.start_at, featured.timezone)}
                      </span>
                      {featured.venue?.city ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" aria-hidden />
                          {featured.venue.city}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-white/80">
                Event terbaru akan muncul di sini setelah dipublikasikan.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

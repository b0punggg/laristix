"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Sparkles, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeroSearch } from "@/components/features/public/public-hero-search";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import { usePublicEventsPageQuery } from "@/hooks/use-public-events";
import { getCategoryGradient } from "@/lib/category-gradients";
import { formatEventDateShort } from "@/lib/datetime";

export function StorefrontHero() {
  const featuredQuery = usePublicEventsPageQuery({ upcoming_days: 30, per_page: 1, sort: "published_at" });
  const featured = featuredQuery.data?.data[0];

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand to-brand-light opacity-[0.92]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-brand-light/20 blur-3xl" />
      </div>

      <Container className="py-12 md:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Copy + search */}
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="size-3.5" aria-hidden />
              Platform tiket event #1 di Indonesia
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Temukan event terbaik,{" "}
                <span className="text-white/80">dalam hitungan detik</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                Konser, festival, workshop, seminar — jelajahi ribuan pengalaman dan amankan tiketmu dengan pembayaran aman.
              </p>
            </div>

            <PublicHeroSearch variant="hero" />

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-brand shadow-md hover:bg-brand-muted">
                <Link href={`${routes.home}?focus=search`}>
                  <Ticket className="size-4" aria-hidden />
                  Jelajahi Event
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
              >
                <Link href={routes.createOrganizer}>
                  Buat Event Kamu
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Pembayaran aman Midtrans
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                E-tiket instan
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Dukungan 24/7
              </span>
            </div>
          </div>

          {/* Featured spotlight */}
          <div className="relative">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">
              Event unggulan
            </p>
            {featuredQuery.isLoading ? (
              <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-white/10" />
            ) : featured ? (
              <Link
                href={routes.publicEvent(featured.uuid)}
                className="ds-focus-ring group block overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
                aria-label={`Event unggulan: ${featured.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {featured.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.banner_url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`flex h-full items-center justify-center bg-gradient-to-br ${getCategoryGradient(featured.category?.slug)}`}
                    >
                      <Calendar className="size-16 text-white/40" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {featured.is_free ? (
                    <span className="absolute left-4 top-4 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-foreground">
                      Gratis
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 p-5">
                  {featured.category ? (
                    <Text variant="overline" className="text-white/60">
                      {featured.category.name}
                    </Text>
                  ) : null}
                  <h2 className="line-clamp-2 text-xl font-bold leading-snug text-white">
                    {featured.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-white/75">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-4 shrink-0" aria-hidden />
                      {formatEventDateShort(featured.start_at, featured.timezone)}
                    </span>
                    {featured.venue?.city ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4 shrink-0" aria-hidden />
                        {featured.venue.city}
                      </span>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:underline">
                    Lihat detail
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/5 p-8 text-center">
                <Calendar className="mb-4 size-12 text-white/30" aria-hidden />
                <p className="text-sm text-white/70">
                  Event terbaru akan muncul di sini setelah dipublikasikan.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

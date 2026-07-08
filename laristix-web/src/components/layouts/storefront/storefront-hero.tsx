"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/env";
import { usePublicEventsPageQuery } from "@/hooks/use-public-events";
import { getCategoryGradient } from "@/lib/category-gradients";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

const AUTO_PLAY_MS = 6000;
const HERO_FILTERS = { upcoming_days: 30, per_page: 5, sort: "published_at" as const };

function HeroBannerSlide({ event, isActive }: { event: Event; isActive: boolean }) {
  return (
    <Link
      href={routes.publicEvent(event.uuid)}
      className={cn(
        "ds-focus-ring absolute inset-0 block transition-opacity duration-700",
        isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
      )}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      aria-label={`Lihat event: ${event.title}`}
    >
      {event.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.banner_url}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center bg-gradient-to-br px-6",
            getCategoryGradient(event.category?.slug),
          )}
        >
          <p className="max-w-3xl text-center text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
            {event.title}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 sm:bottom-5">
        <span className="inline-flex w-max max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm shadow-lg transition group-hover/hero:bg-brand-muted sm:gap-3 sm:px-5 sm:py-3 sm:text-base">
          <span className="text-foreground">
            <span className="font-medium">{event.title}</span>
            <span className="ml-2 font-semibold text-brand">Siap-siap beli tiketnya!</span>
          </span>
          <Ticket className="size-4 shrink-0 text-brand sm:size-5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function HeroBannerSkeleton() {
  return (
    <section className="relative w-full overflow-hidden bg-muted">
      <Skeleton className="h-[220px] w-full sm:h-[280px] md:h-[340px] lg:h-[400px]" />
    </section>
  );
}

export function StorefrontHero() {
  const featuredQuery = usePublicEventsPageQuery(HERO_FILTERS);
  const slides = featuredQuery.data?.data ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = slides.length;
  const activeEvent = slides[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) return;
      setActiveIndex((index + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goNext = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      goTo(activeIndex + 1);
    },
    [activeIndex, goTo],
  );

  const goPrev = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      goTo(activeIndex - 1);
    },
    [activeIndex, goTo],
  );

  const goToDot = useCallback(
    (event: React.MouseEvent, index: number) => {
      event.preventDefault();
      event.stopPropagation();
      goTo(index);
    },
    [goTo],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, slideCount]);

  if (featuredQuery.isLoading) {
    return <HeroBannerSkeleton />;
  }

  if (!activeEvent) {
    return (
      <section className="relative flex h-[220px] w-full items-center justify-center bg-gradient-to-br from-brand-deep via-brand to-brand-light sm:h-[280px] md:h-[340px] lg:h-[400px]">
        <div className="mx-auto max-w-2xl px-4 text-center text-white">
          <h1 className="text-2xl font-bold sm:text-3xl">Temukan event terbaik di Laristix</h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            Event unggulan akan muncul di sini setelah dipublikasikan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="group/hero relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Event unggulan"
    >
      <div className="relative h-[220px] w-full sm:h-[280px] md:h-[340px] lg:h-[400px]">
        <h1 className="sr-only">Temukan event terbaik di Laristix</h1>
        {slides.map((event, index) => (
          <HeroBannerSlide key={event.uuid} event={event} isActive={index === activeIndex} />
        ))}

        {slideCount > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="ds-focus-ring absolute left-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white sm:left-4 sm:size-10"
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="ds-focus-ring absolute right-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white sm:right-4 sm:size-10"
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="pointer-events-none absolute bottom-[4.75rem] left-4 z-20 flex items-center gap-2 sm:bottom-5 sm:left-6">
              {slides.map((event, index) => (
                <button
                  key={event.uuid}
                  type="button"
                  onClick={(event) => goToDot(event, index)}
                  className={cn(
                    "pointer-events-auto rounded-full bg-white transition-all",
                    index === activeIndex ? "size-2.5 opacity-100" : "size-2 opacity-50 hover:opacity-80",
                  )}
                  aria-label={`Ke slide ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import { createEventOnboardingTarget } from "@/lib/public-create-event-data";
import { cn } from "@/lib/utils";

interface EventOnboardingBannerProps {
  className?: string;
}

export function EventOnboardingBanner({ className }: EventOnboardingBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 via-brand-muted/40 to-transparent p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
            <Clock3 className="size-4" aria-hidden />
            Onboarding event creator
          </p>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            Buat event pertama dalam 5 menit
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Isi detail dasar, jadwal, dan lokasi untuk menyimpan draft. Setelah itu atur tiket dan
            publikasikan saat siap.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 border-brand/30">
          <Link href={routes.buatEvent}>
            Lihat panduan
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function isEventOnboardingMode(searchParams: Pick<URLSearchParams, "get">): boolean {
  return searchParams.get("onboarding") === "1";
}

export { createEventOnboardingTarget };

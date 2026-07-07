"use client";

import { BarChart3, Calendar, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { usePublicPlatformStatsQuery } from "@/hooks/use-public-platform";

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}rb+`;
  }
  return `${value}+`;
}

const statItems = [
  { key: "events", icon: Calendar, label: "Event dipublikasikan" },
  { key: "organizers", icon: Users, label: "Organizer aktif" },
  { key: "growth", icon: BarChart3, label: "Pertumbuhan tahunan" },
] as const;

export function PublicHomeStatsSection() {
  const statsQuery = usePublicPlatformStatsQuery();
  const stats = statsQuery.data;

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="mb-8 text-center">
          <Text variant="h2">Laristix dalam Angka</Text>
          <Text variant="caption" className="mt-2">
            Platform yang dipercaya ribuan organizer dan peserta
          </Text>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {statsQuery.isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))
            : statItems.map((item, index) => {
                const Icon = item.icon;
                const value =
                  index === 0
                    ? formatCount(stats?.published_events_count ?? 0)
                    : index === 1
                      ? formatCount(stats?.organizer_count ?? 0)
                      : "150%";

                return (
                  <div
                    key={item.key}
                    className="group relative overflow-hidden rounded-2xl border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="absolute -right-4 -top-4 size-24 rounded-full bg-brand-muted opacity-50 transition-transform duration-300 group-hover:scale-110" />
                    <div className="relative">
                      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand">
                        <Icon className="size-6" aria-hidden />
                      </div>
                      <p className="text-3xl font-extrabold tracking-tight text-brand">{value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                    </div>
                  </div>
                );
              })}
        </div>
      </Container>
    </section>
  );
}

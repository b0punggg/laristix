"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import { useFeaturedOrganizersQuery } from "@/hooks/use-public-platform";

export function PublicHomeOrganizersSection() {
  const organizersQuery = useFeaturedOrganizersQuery();
  const organizers = organizersQuery.data ?? [];

  if (!organizersQuery.isLoading && organizers.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface py-12 md:py-16">
      <Container className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Text variant="h2">Organizer Terpercaya</Text>
            <Text variant="caption" className="mt-1">
              Partner yang telah mempercayakan eventnya pada Laristix
            </Text>
          </div>
          <Link
            href={routes.createOrganizer}
            className="ds-focus-ring hidden items-center gap-1 text-sm font-medium text-brand hover:underline sm:inline-flex"
          >
            Jadi organizer
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {organizersQuery.isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="size-36 shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-thin">
            {organizers.map((organizer) => (
              <Link
                key={organizer.uuid}
                href={routes.publicCreator(organizer.slug)}
                className="flex w-36 shrink-0 flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {organizer.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={organizer.logo_url}
                    alt={organizer.name}
                    className="size-16 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-brand-muted text-lg font-bold text-brand">
                    {organizer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="line-clamp-2 text-sm font-semibold leading-tight">{organizer.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {organizer.published_events_count} event
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

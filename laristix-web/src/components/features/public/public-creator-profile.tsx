"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, ChevronLeft, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PublicDiscoveryErrorState,
  PublicEmptyEventsState,
} from "@/components/features/public/public-discovery-states";
import { PublicEventCard } from "@/components/features/public/public-event-card";
import { PublicEventGridSkeleton } from "@/components/features/public/public-event-card-skeleton";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import {
  usePublicCreatorEventsQuery,
  usePublicCreatorQuery,
} from "@/hooks/use-public-creator";
import { cn } from "@/lib/utils";

type CreatorEventTab = "active" | "past";

interface PublicCreatorProfileProps {
  slug: string;
}

function formatJoinedDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function PublicCreatorProfile({ slug }: PublicCreatorProfileProps) {
  const [activeTab, setActiveTab] = useState<CreatorEventTab>("active");
  const creatorQuery = usePublicCreatorQuery(slug);
  const eventsQuery = usePublicCreatorEventsQuery(
    slug,
    activeTab,
    1,
    Boolean(creatorQuery.data),
  );

  const creator = creatorQuery.data;
  const events = eventsQuery.data?.data ?? [];

  if (creatorQuery.isLoading) {
    return <PublicCreatorProfileSkeleton />;
  }

  if (creatorQuery.isError || !creator) {
    return (
      <Container className="py-10">
        <Button variant="ghost" asChild className="-ml-2 mb-6">
          <Link href={routes.home}>
            <ChevronLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">Creator tidak ditemukan</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Halaman creator ini tidak tersedia atau belum dipublikasikan.
          </p>
        </div>
      </Container>
    );
  }

  const initials = creator.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pb-16">
      <section className="border-b bg-surface">
        <Container className="py-8 md:py-10">
          <Button variant="ghost" asChild className="-ml-2 mb-6">
            <Link href={routes.home}>
              <ChevronLeft className="size-4" />
              Kembali
            </Link>
          </Button>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <Avatar className="size-24 border-4 border-background shadow-md md:size-28">
              {creator.logo_url ? (
                <AvatarImage src={creator.logo_url} alt={creator.name} />
              ) : null}
              <AvatarFallback className="bg-brand-muted text-2xl font-bold text-brand">
                {initials || <Building2 className="size-8" />}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <Text variant="h1" className="text-3xl md:text-4xl">
                  {creator.name}
                </Text>
                {creator.description ? (
                  <p className="mt-3 max-w-2xl text-muted-foreground">{creator.description}</p>
                ) : null}
                {creator.website ? (
                  <a
                    href={creator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                  >
                    <Globe className="size-4" aria-hidden />
                    {creator.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:max-w-lg">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Total Event
                    </p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      {creator.total_events_count}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Bergabung pada
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {formatJoinedDate(creator.joined_at)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-10">
        <div className="mb-8 border-b border-border/80">
          <div className="flex gap-1">
            {(
              [
                { id: "active" as const, label: "Event Aktif" },
                { id: "past" as const, label: "Event Lalu" },
              ] satisfies Array<{ id: CreatorEventTab; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative shrink-0 px-4 py-4 text-sm font-semibold transition-colors",
                  activeTab === tab.id
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {activeTab === tab.id ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {eventsQuery.isLoading ? <PublicEventGridSkeleton count={8} /> : null}

        {eventsQuery.isError ? (
          <PublicDiscoveryErrorState
            message="Gagal memuat event creator."
            onRetry={() => eventsQuery.refetch()}
          />
        ) : null}

        {!eventsQuery.isLoading && !eventsQuery.isError && events.length === 0 ? (
          <PublicEmptyEventsState hasFilters={false} />
        ) : null}

        {!eventsQuery.isLoading && !eventsQuery.isError && events.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {events.map((event, index) => (
              <PublicEventCard key={event.uuid} event={event} animationIndex={index % 12} />
            ))}
          </div>
        ) : null}
      </Container>
    </div>
  );
}

function PublicCreatorProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <Container className="space-y-6 py-8 md:py-10">
        <Skeleton className="h-9 w-24" />
        <div className="flex flex-col gap-6 md:flex-row">
          <Skeleton className="size-24 rounded-full md:size-28" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-64 max-w-full" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <div className="grid gap-4 sm:grid-cols-2 sm:max-w-lg">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
        </div>
      </Container>
      <Container className="py-8">
        <Skeleton className="mb-8 h-10 w-56" />
        <PublicEventGridSkeleton count={8} />
      </Container>
    </div>
  );
}

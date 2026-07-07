import Link from "next/link";
import { Building2, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicEventFavoriteButton } from "@/components/features/public/public-event-favorite-button";
import { routes } from "@/config/env";
import { getCategoryGradient } from "@/lib/category-gradients";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/currency";
import { formatEventDateShort } from "@/lib/datetime";
import { isAlmostSoldOut, isNewEvent } from "@/lib/public-event-badges";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

interface PublicEventCardProps {
  event: Event;
  compact?: boolean;
  animationIndex?: number;
}

export function PublicEventCard({
  event,
  compact = false,
  animationIndex = 0,
}: PublicEventCardProps) {
  const venueLabel = event.venue?.city ?? event.venue?.name ?? null;
  const CategoryIcon = getCategoryIcon(event.category?.icon);
  const gradient = getCategoryGradient(event.category?.slug);
  const showNew = isNewEvent(event);
  const showAlmostSold = isAlmostSoldOut(event);
  const priceLabel = event.is_free
    ? "Gratis"
    : event.min_ticket_price && event.min_ticket_price > 0
      ? `Mulai ${formatCurrency(event.min_ticket_price)}`
      : null;

  return (
    <Link
      href={routes.publicEvent(event.uuid)}
      className={cn(
        "ds-focus-ring ds-animate-slide-up group block h-full",
      )}
      style={{ animationDelay: `${animationIndex * 50}ms` }}
      aria-label={`Lihat event ${event.title}`}
    >
      <Card
        variant="interactive"
        padding="none"
        className="h-full overflow-hidden border-border/80"
      >
        {/* Thumbnail */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {event.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.banner_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full items-center justify-center bg-gradient-to-br ${gradient}`}>
              <CategoryIcon className="size-12 text-white/50" aria-hidden />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Status badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {event.is_free ? (
              <Badge variant="success" className="shadow-sm">
                Gratis
              </Badge>
            ) : null}
            {showNew ? (
              <Badge variant="brand" className="shadow-sm">
                Baru
              </Badge>
            ) : null}
            {showAlmostSold ? (
              <Badge variant="warning" className="shadow-sm">
                Hampir habis
              </Badge>
            ) : null}
          </div>

          {/* Favorite */}
          <PublicEventFavoriteButton
            eventTitle={event.title}
            className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
          />
        </div>

        <CardContent className={cn("space-y-3", compact ? "p-3.5" : "p-4")}>
          {/* Category */}
          {event.category ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
              <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
              {event.category.name}
            </p>
          ) : null}

          {/* Title */}
          <h3
            className={cn(
              "line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-brand",
              compact ? "text-sm" : "text-base",
            )}
          >
            {event.title}
          </h3>

          {/* Date & location */}
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              {formatEventDateShort(event.start_at, event.timezone)}
            </p>
            {venueLabel ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="line-clamp-1">{venueLabel}</span>
              </p>
            ) : null}
          </div>

          {/* Price + organizer */}
          <div className="flex items-end justify-between gap-2 border-t border-border/60 pt-3">
            <div className="min-w-0">
              {priceLabel ? (
                <p className={cn("font-bold text-foreground", compact ? "text-sm" : "text-base")}>
                  {priceLabel}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Harga segera hadir</p>
              )}
              {event.organizer ? (
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                  <Building2 className="size-3 shrink-0" aria-hidden />
                  {event.organizer.name}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

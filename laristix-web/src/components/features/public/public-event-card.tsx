import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
        "storefront-focus-ring storefront-card-enter group block h-full rounded-lg",
      )}
      style={{ animationDelay: `${animationIndex * 60}ms` }}
      aria-label={`Lihat event ${event.title}`}
    >
      <Card className="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative aspect-[16/9] bg-muted">
          {event.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.banner_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`flex h-full items-center justify-center bg-gradient-to-br ${gradient}`}>
              <CategoryIcon className="size-10 text-white/60" aria-hidden />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {event.is_free ? <Badge variant="success">Gratis</Badge> : null}
            {showNew ? <Badge variant="secondary">Baru</Badge> : null}
            {showAlmostSold ? <Badge variant="warning">Hampir habis</Badge> : null}
          </div>
        </div>
        <CardContent className={compact ? "space-y-2 p-3" : "space-y-3 p-4"}>
          {event.category ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
              {event.category.name}
            </p>
          ) : null}
          <h3
            className={cn(
              "line-clamp-2 font-semibold leading-snug group-hover:text-brand",
              compact ? "text-base" : "text-lg",
            )}
          >
            {event.title}
          </h3>
          {!compact && event.short_description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{event.short_description}</p>
          ) : null}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" aria-hidden />
              {formatEventDateShort(event.start_at, event.timezone)}
            </p>
            {venueLabel ? (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {venueLabel}
              </p>
            ) : null}
          </div>
          {priceLabel ? (
            <p className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
              {priceLabel}
            </p>
          ) : null}
          {!compact && event.organizer ? (
            <p className="text-xs text-muted-foreground">oleh {event.organizer.name}</p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

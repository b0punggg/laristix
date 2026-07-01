import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/env";
import { formatEventDateShort } from "@/lib/datetime";
import type { Event } from "@/types/event";

interface PublicEventCardProps {
  event: Event;
}

export function PublicEventCard({ event }: PublicEventCardProps) {
  const venueLabel = event.venue?.city ?? event.venue?.name ?? null;

  return (
    <Link href={routes.publicEvent(event.uuid)} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[16/9] bg-muted">
          {event.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.banner_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Calendar className="size-10 text-primary/40" />
            </div>
          )}
          {event.is_free ? (
            <Badge className="absolute left-3 top-3" variant="success">
              Gratis
            </Badge>
          ) : null}
        </div>
        <CardContent className="space-y-3 p-4">
          {event.category ? (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {event.category.name}
            </p>
          ) : null}
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
            {event.title}
          </h3>
          {event.short_description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{event.short_description}</p>
          ) : null}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              {formatEventDateShort(event.start_at, event.timezone)}
            </p>
            {venueLabel ? (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {venueLabel}
              </p>
            ) : null}
          </div>
          {event.organizer ? (
            <p className="text-xs text-muted-foreground">oleh {event.organizer.name}</p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

import * as React from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/design-system/primitives/text";

export interface EventCardProps {
  title: string;
  imageUrl?: string | null;
  imageAlt?: string;
  date?: string;
  location?: string;
  price?: string;
  badge?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function EventCard({
  title,
  imageUrl,
  imageAlt,
  date,
  location,
  price,
  badge,
  footer,
  onClick,
  className,
}: EventCardProps) {
  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
            fill
            className="object-cover transition-transform duration-slow group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-muted text-brand">
            <Calendar className="size-8" aria-hidden />
          </div>
        )}
        {badge ? (
          <Badge className="absolute left-3 top-3" variant="brand">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <Text variant="h4" className="line-clamp-2">
          {title}
        </Text>
        {date ? (
          <p className="flex items-center gap-1.5 ds-caption">
            <Calendar className="size-3.5 shrink-0" aria-hidden />
            {date}
          </p>
        ) : null}
        {location ? (
          <p className="flex items-center gap-1.5 ds-caption">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-1">{location}</span>
          </p>
        ) : null}
        {price ? <p className="text-sm font-semibold text-brand">{price}</p> : null}
      </div>
      {footer ? <div className="border-t p-4 pt-0">{footer}</div> : null}
    </>
  );

  const shellClass = cn(
    "group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-normal ease-out-expo hover:-translate-y-0.5 hover:shadow-md",
    onClick && "cursor-pointer text-left",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shellClass}>
        {content}
      </button>
    );
  }

  return <div className={shellClass}>{content}</div>;
}

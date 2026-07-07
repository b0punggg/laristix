"use client";

import { Heart } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

interface PublicEventFavoriteButtonProps {
  eventTitle: string;
  className?: string;
}

export function PublicEventFavoriteButton({ eventTitle, className }: PublicEventFavoriteButtonProps) {
  return (
    <IconButton
      type="button"
      variant="ghost"
      size="sm"
      label={`Simpan event ${eventTitle}`}
      className={cn(
        "size-9 rounded-full bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Heart className="size-4 text-muted-foreground" aria-hidden />
    </IconButton>
  );
}

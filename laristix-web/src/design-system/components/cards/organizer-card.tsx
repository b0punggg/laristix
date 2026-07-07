import * as React from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/design-system/primitives/text";

export interface OrganizerCardProps {
  name: string;
  description?: string;
  logoUrl?: string | null;
  eventCount?: number;
  verified?: boolean;
  footer?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function OrganizerCard({
  name,
  description,
  logoUrl,
  eventCount,
  verified,
  footer,
  onClick,
  className,
}: OrganizerCardProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const body = (
    <Card variant={onClick ? "interactive" : "default"} className={cn("h-full", className)}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            {logoUrl ? <AvatarImage src={logoUrl} alt={name} /> : null}
            <AvatarFallback>{initials || <Building2 className="size-5" />}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="h4" className="truncate">
                {name}
              </Text>
              {verified ? <Badge variant="success">Terverifikasi</Badge> : null}
            </div>
            {description ? (
              <Text variant="caption" className="mt-1 line-clamp-2">
                {description}
              </Text>
            ) : null}
          </div>
        </div>
        {eventCount !== undefined ? (
          <Text variant="caption">{eventCount} event</Text>
        ) : null}
        {footer}
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {body}
      </button>
    );
  }

  return body;
}

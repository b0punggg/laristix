import * as React from "react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Text } from "@/design-system/primitives/text";

export interface ProfileCardProps {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ProfileCard({ name, email, role, avatarUrl, meta, actions, className }: ProfileCardProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <Avatar className="size-16">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Text variant="h3">{name}</Text>
            {role ? <Badge variant="secondary">{role}</Badge> : null}
          </div>
          {email ? (
            <p className="mt-1 flex items-center justify-center gap-1.5 ds-caption sm:justify-start">
              <Mail className="size-3.5" aria-hidden />
              {email}
            </p>
          ) : null}
          {meta ? <div className="mt-3">{meta}</div> : null}
        </div>
      </CardContent>
      {actions ? <CardFooter className="border-t p-4">{actions}</CardFooter> : null}
    </Card>
  );
}

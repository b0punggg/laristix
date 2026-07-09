"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { buildCreateEventFunnelHref } from "@/lib/create-event-funnel";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface CreateEventCtaButtonProps extends ComponentProps<typeof Button> {
  label?: string;
}

export function CreateEventCtaButton({
  label = "Buat Event Sekarang",
  className,
  asChild,
  ...props
}: CreateEventCtaButtonProps) {
  const user = useAuthStore((s) => s.user);
  const href = buildCreateEventFunnelHref({
    isAuthenticated: Boolean(user),
    hasActiveOrganizer: Boolean(user?.active_organizer),
  });

  return (
    <Button asChild className={cn(className)} {...props}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}

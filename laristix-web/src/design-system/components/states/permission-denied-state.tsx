import { ShieldX } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Text } from "@/design-system/primitives/text";

export interface PermissionDeniedStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function PermissionDeniedState({
  title = "Akses ditolak",
  description = "Anda tidak memiliki izin untuk melihat halaman ini.",
  actionHref = "/",
  actionLabel = "Kembali",
  className,
}: PermissionDeniedStateProps) {
  return (
    <div className={cn("flex flex-col items-center py-20 text-center", className)} role="alert">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-danger-muted">
        <ShieldX className="size-8 text-danger" aria-hidden />
      </div>
      <Text variant="h2">{title}</Text>
      <Text variant="caption" className="mt-2 max-w-md">
        {description}
      </Text>
      <Button asChild variant="outline" className="mt-8">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

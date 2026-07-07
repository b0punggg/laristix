import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Text } from "@/design-system/primitives/text";

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
}

export function NotFoundState({
  title = "Halaman tidak ditemukan",
  description = "Halaman yang Anda cari tidak ada atau telah dipindahkan.",
  homeHref = "/",
  homeLabel = "Kembali ke beranda",
  className,
}: NotFoundStateProps) {
  return (
    <div className={cn("flex flex-col items-center py-20 text-center", className)}>
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
        <FileQuestion className="size-8 text-muted-foreground" aria-hidden />
      </div>
      <Text variant="h2">{title}</Text>
      <Text variant="caption" className="mt-2 max-w-md">
        {description}
      </Text>
      <Button asChild className="mt-8">
        <Link href={homeHref}>{homeLabel}</Link>
      </Button>
    </div>
  );
}

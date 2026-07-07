"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/design-system/primitives/text";
import { cn } from "@/lib/utils";

interface PublicEventListPaginationProps {
  loadedCount: number;
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  className?: string;
}

export function PublicEventListPagination({
  loadedCount,
  total,
  currentPage,
  lastPage,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  className,
}: PublicEventListPaginationProps) {
  const progress = total > 0 ? Math.min(100, (loadedCount / total) * 100) : 0;
  const allLoaded = !hasNextPage && loadedCount > 0;

  if (total === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4 pt-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <Text variant="caption">
            Menampilkan <span className="font-semibold text-foreground">{loadedCount}</span> dari{" "}
            <span className="font-semibold text-foreground">{total}</span> event
          </Text>
          {lastPage > 1 ? (
            <Text variant="caption">
              Halaman {currentPage} / {lastPage}
            </Text>
          ) : null}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={loadedCount}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`${loadedCount} dari ${total} event dimuat`}
          />
        </div>
      </div>

      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="min-w-[220px] gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Memuat event...
              </>
            ) : (
              "Muat lebih banyak"
            )}
          </Button>
        </div>
      ) : allLoaded ? (
        <p className="text-center text-sm text-muted-foreground">
          Semua event telah ditampilkan
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showSummary?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className,
  showSummary = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {showSummary ? (
        <p className="ds-body-md text-muted-foreground">
          Halaman {currentPage} dari {totalPages}
          {totalItems !== undefined ? ` (${totalItems} total)` : ""}
        </p>
      ) : (
        <span className="sr-only">
          Halaman {currentPage} dari {totalPages}
        </span>
      )}
      <div className="flex items-center gap-1">
        <IconButton
          variant="outline"
          size="sm"
          label="Halaman sebelumnya"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
        </IconButton>
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground" aria-hidden>
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "primary" : "ghost"}
              size="sm"
              className="min-w-9"
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ),
        )}
        <IconButton
          variant="outline"
          size="sm"
          label="Halaman berikutnya"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
    </nav>
  );
}

function buildPageRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | "ellipsis"> = [1];
  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

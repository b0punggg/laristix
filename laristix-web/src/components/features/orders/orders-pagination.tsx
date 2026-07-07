"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrdersPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function OrdersPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: OrdersPaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 2),
    Math.min(totalPages, page + 1),
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Menampilkan <span className="font-medium text-foreground">{start}–{end}</span> dari{" "}
        <span className="font-medium text-foreground">{totalItems}</span> transaksi
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="size-4" />
          Sebelumnya
        </Button>
        <div className="flex items-center gap-1.5">
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              size="sm"
              variant={pageNumber === page ? "default" : "outline"}
              className="min-w-9"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Selanjutnya
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

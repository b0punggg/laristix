"use client";

import { Button } from "@/components/ui/button";
import type { PaginatedMeta } from "@/types/event";

interface ListPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
}

export function ListPagination({ meta, onPageChange }: ListPaginationProps) {
  if (meta.last_page <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Page {meta.current_page} of {meta.last_page} ({meta.total} total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

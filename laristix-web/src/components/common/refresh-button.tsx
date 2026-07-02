"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeUpdatedAt } from "@/lib/format";

interface RefreshButtonProps {
  onRefresh: () => void;
  isFetching?: boolean;
  updatedAt?: number;
  label?: string;
}

export function RefreshButton({
  onRefresh,
  isFetching = false,
  updatedAt,
  label = "Refresh",
}: RefreshButtonProps) {
  return (
    <div className="flex items-center gap-2">
      {updatedAt ? (
        <span className="text-xs text-muted-foreground">
          Updated {formatRelativeUpdatedAt(updatedAt)}
        </span>
      ) : null}
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isFetching}>
        {isFetching ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 size-4" />
        )}
        {label}
      </Button>
    </div>
  );
}

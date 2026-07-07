"use client";

import { Download, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormTabButton } from "@/components/features/events/event-management-ui";
import {
  transactionFilterOptions,
  type TransactionFilter,
} from "@/lib/transactions";

interface OrdersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: TransactionFilter;
  onFilterChange: (value: TransactionFilter) => void;
  onExport: () => void;
  exportDisabled?: boolean;
  totalCount?: number;
}

export function OrdersToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onExport,
  exportDisabled,
  totalCount,
}: OrdersToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari no. order atau nama event..."
            className="h-11 pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative sm:hidden">
            <SlidersHorizontal
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as TransactionFilter)}
              className="h-11 min-w-[200px] pl-9"
            >
              {transactionFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="outline"
            className="h-11 gap-2"
            onClick={onExport}
            disabled={exportDisabled}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="hidden flex-wrap gap-2 sm:flex">
        {transactionFilterOptions.map((option) => (
          <FormTabButton
            key={option.value}
            active={filter === option.value}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </FormTabButton>
        ))}
      </div>

      {totalCount !== undefined ? (
        <p className="text-sm text-muted-foreground">{totalCount} transaksi ditemukan</p>
      ) : null}
    </div>
  );
}

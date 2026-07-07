"use client";

import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface SalesPeriodFields {
  sales_start_at?: string;
  sales_end_at?: string;
}

interface TicketSalesPeriodEditorProps {
  register: UseFormRegister<SalesPeriodFields>;
  errors: FieldErrors<SalesPeriodFields>;
  startValue?: string;
  endValue?: string;
}

export function TicketSalesPeriodEditor({
  register,
  errors,
  startValue,
  endValue,
}: TicketSalesPeriodEditorProps) {
  const hasRestriction = Boolean(startValue || endValue);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="sales_start_at"
          label="Mulai penjualan"
          helpText="Kosongkan untuk segera dibuka"
          error={errors.sales_start_at?.message}
        >
          <div className="relative">
            <Calendar
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="sales_start_at"
              type="datetime-local"
              className="h-11 pl-9"
              {...register("sales_start_at")}
            />
          </div>
        </FormField>

        <FormField
          id="sales_end_at"
          label="Akhir penjualan"
          helpText="Kosongkan untuk tanpa batas akhir"
          error={errors.sales_end_at?.message}
        >
          <div className="relative">
            <Clock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="sales_end_at"
              type="datetime-local"
              className="h-11 pl-9"
              {...register("sales_end_at")}
            />
          </div>
        </FormField>
      </div>

      <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        {hasRestriction
          ? "Penjualan dibatasi periode yang Anda tentukan."
          : "Tanpa batas waktu — tiket dapat dibeli kapan saja selama event aktif."}
      </p>
    </div>
  );
}

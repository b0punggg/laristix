"use client";

import { Calendar, Clock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

const timezones = [
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Bangkok",
  "Asia/Makassar",
  "Asia/Jayapura",
  "UTC",
];

interface ScheduleFields {
  start_at: string;
  end_at: string;
  timezone: string;
}

interface EventScheduleEditorProps {
  register: UseFormRegister<ScheduleFields>;
  errors: FieldErrors<ScheduleFields>;
  startValue?: string;
  endValue?: string;
}

export function EventScheduleEditor({
  register,
  errors,
  startValue,
  endValue,
}: EventScheduleEditorProps) {
  const duration =
    startValue && endValue
      ? (() => {
          const ms = new Date(endValue).getTime() - new Date(startValue).getTime();
          if (Number.isNaN(ms) || ms <= 0) return null;
          const hours = Math.floor(ms / 3_600_000);
          const days = Math.floor(hours / 24);
          if (days > 0) return `${days} hari ${hours % 24} jam`;
          return `${hours} jam`;
        })()
      : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="start_at"
          label="Mulai"
          required
          error={errors.start_at?.message}
          helpText="Waktu mulai event"
        >
          <div className="relative">
            <Calendar
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="start_at"
              type="datetime-local"
              className="h-11 pl-9"
              {...register("start_at")}
            />
          </div>
        </FormField>

        <FormField
          id="end_at"
          label="Selesai"
          required
          error={errors.end_at?.message}
          helpText="Harus setelah waktu mulai"
        >
          <div className="relative">
            <Clock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input id="end_at" type="datetime-local" className="h-11 pl-9" {...register("end_at")} />
          </div>
        </FormField>
      </div>

      <FormField id="timezone" label="Zona waktu" required error={errors.timezone?.message}>
        <div className="relative">
          <Globe
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Select id="timezone" className="h-11 pl-9" {...register("timezone")}>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
        </div>
      </FormField>

      {duration ? (
        <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Durasi event: <span className="font-medium text-foreground">{duration}</span>
        </p>
      ) : null}
    </div>
  );
}

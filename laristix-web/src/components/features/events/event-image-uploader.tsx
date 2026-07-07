"use client";

import { ImageIcon, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

interface EventImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  name?: string;
  className?: string;
}

export function EventImageUploader({
  value = "",
  onChange,
  onBlur,
  error,
  name,
  className,
}: EventImageUploaderProps) {
  const hasPreview = value.trim().length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed bg-muted/30",
          hasPreview ? "border-border" : "border-border/80",
        )}
      >
        {hasPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Preview banner event"
            className="aspect-[21/9] w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex aspect-[21/9] flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
              <ImageIcon className="size-7" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Banner event</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tempel URL gambar banner. Rasio disarankan 21:9.
              </p>
            </div>
          </div>
        )}
      </div>

      <FormField
        id="banner_url"
        label="URL banner"
        helpText="Gunakan link gambar publik (HTTPS)."
        error={error}
      >
        <div className="relative">
          <Link2
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="banner_url"
            name={name}
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            placeholder="https://cdn.example.com/banner.jpg"
            className="h-11 pl-9"
          />
        </div>
      </FormField>
    </div>
  );
}

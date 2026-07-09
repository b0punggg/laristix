"use client";

import { useRef, useState } from "react";
import { ImageIcon, Link2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { getApiErrorMessage } from "@/lib/api/client";
import { eventApi } from "@/services/event/event-api";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const RECOMMENDED_WIDTH = 724;
const RECOMMENDED_HEIGHT = 340;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface EventImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  name?: string;
  className?: string;
}

function validateImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const ratio = image.width / image.height;
      const targetRatio = RECOMMENDED_WIDTH / RECOMMENDED_HEIGHT;

      if (Math.abs(ratio - targetRatio) > 0.35) {
        resolve(`Rasio gambar disarankan 21:9 (contoh ${RECOMMENDED_WIDTH}×${RECOMMENDED_HEIGHT}px).`);
        return;
      }

      resolve(null);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("Gagal membaca file gambar.");
    };

    image.src = objectUrl;
  });
}

export function EventImageUploader({
  value = "",
  onChange,
  onBlur,
  error,
  name,
  className,
}: EventImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const hasPreview = value.trim().length > 0;
  const displayError = error ?? uploadError ?? undefined;

  async function handleFileSelect(file: File | null) {
    if (!file) {
      return;
    }

    setUploadError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Format harus JPEG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("Ukuran file maksimal 2 MB.");
      return;
    }

    const dimensionWarning = await validateImageDimensions(file);
    if (dimensionWarning) {
      setUploadError(dimensionWarning);
      return;
    }

    setIsUploading(true);

    try {
      const url = await eventApi.uploadBanner(file);
      onChange(url);
    } catch (uploadFailure) {
      setUploadError(getApiErrorMessage(uploadFailure, "Gagal mengunggah banner."));
    } finally {
      setIsUploading(false);
    }
  }

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
                Unggah gambar atau tempel URL. Disarankan {RECOMMENDED_WIDTH}×{RECOMMENDED_HEIGHT}px (21:9), maks. 2 MB.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleFileSelect(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengunggah...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Unggah gambar
            </>
          )}
        </Button>
        {hasPreview ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Hapus banner
          </Button>
        ) : null}
      </div>

      <FormField
        id="banner_url"
        label="Atau tempel URL banner"
        helpText="Gunakan link gambar publik (HTTPS) jika tidak mengunggah file."
        error={displayError}
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
            onChange={(event) => {
              setUploadError(null);
              onChange(event.target.value);
            }}
            onBlur={onBlur}
            placeholder="https://cdn.example.com/banner.jpg"
            className="h-11 pl-9"
            disabled={isUploading}
          />
        </div>
      </FormField>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { getApiErrorMessage } from "@/lib/api/client";
import { eventApi } from "@/services/event/event-api";
import type { EventGalleryItem } from "@/lib/event-page-content";

interface EventGalleryEditorProps {
  items: EventGalleryItem[];
  onChange: (items: EventGalleryItem[]) => void;
}

export function EventGalleryEditor({ items, onChange }: EventGalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadIndex, setUploadIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function updateItem(index: number, patch: Partial<EventGalleryItem>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) {
      return;
    }

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    onChange([...items, { url: "", alt: "" }]);
  }

  async function handleUpload(file: File, index: number) {
    setUploadError(null);
    setUploadIndex(index);

    try {
      const url = await eventApi.uploadBanner(file);
      updateItem(index, { url });
    } catch (error) {
      setUploadError(getApiErrorMessage(error, "Gagal mengunggah gambar."));
    } finally {
      setUploadIndex(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Tambahkan foto tambahan selain banner. Galeri ditampilkan di halaman publik event jika ada lebih dari satu gambar.
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <ImageIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Belum ada gambar di galeri.</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border p-4">
            <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.alt ?? "Galeri"} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-8" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <FormField id={`gallery-url-${index}`} label="URL gambar">
                  <Input
                    value={item.url}
                    onChange={(event) => updateItem(index, { url: event.target.value })}
                    placeholder="https://..."
                  />
                </FormField>
                <FormField id={`gallery-alt-${index}`} label="Teks alternatif">
                  <Input
                    value={item.alt ?? ""}
                    onChange={(event) => updateItem(index, { alt: event.target.value })}
                    placeholder="Deskripsi singkat gambar"
                  />
                </FormField>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={index === 0 ? inputRef : undefined}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleUpload(file, index);
                      }
                      event.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadIndex === index}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/jpeg,image/png,image/webp";
                      input.onchange = (event) => {
                        const file = (event.target as HTMLInputElement).files?.[0];
                        if (file) {
                          void handleUpload(file, index);
                        }
                      };
                      input.click();
                    }}
                  >
                    {uploadIndex === index ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        Unggah
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}

      <Button type="button" variant="outline" onClick={addItem}>
        <Plus className="size-4" />
        Tambah gambar
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useCreateEventTagMutation, useEventTagsQuery } from "@/hooks/use-phase-c";
import type { EventCategory } from "@/types/event";

interface EventTaxonomyFieldsProps {
  categories: EventCategory[];
  selectedCategoryIds: string[];
  selectedTagIds: string[];
  onCategoryChange: (ids: string[]) => void;
  onTagChange: (ids: string[]) => void;
  categoryError?: string;
}

export function EventTaxonomyFields({
  categories,
  selectedCategoryIds,
  selectedTagIds,
  onCategoryChange,
  onTagChange,
  categoryError,
}: EventTaxonomyFieldsProps) {
  const tagsQuery = useEventTagsQuery();
  const createTagMutation = useCreateEventTagMutation();
  const [newTagName, setNewTagName] = useState("");

  function toggleCategory(id: string) {
    if (selectedCategoryIds.includes(id)) {
      onCategoryChange(selectedCategoryIds.filter((item) => item !== id));
      return;
    }

    onCategoryChange([...selectedCategoryIds, id]);
  }

  function toggleTag(id: string) {
    if (selectedTagIds.includes(id)) {
      onTagChange(selectedTagIds.filter((item) => item !== id));
      return;
    }

    onTagChange([...selectedTagIds, id]);
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) {
      return;
    }

    const tag = await createTagMutation.mutateAsync(newTagName.trim());
    onTagChange([...selectedTagIds, String(tag.id)]);
    setNewTagName("");
  }

  return (
    <div className="space-y-6">
      <FormField id="event-categories" label="Kategori" required error={categoryError} helpText="Pilih satu atau lebih. Kategori pertama jadi kategori utama.">
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Checkbox
                checked={selectedCategoryIds.includes(String(category.id))}
                onCheckedChange={() => toggleCategory(String(category.id))}
              />
              {category.name}
            </label>
          ))}
        </div>
      </FormField>

      <FormField id="event-tags" label="Tag event" helpText="Opsional. Membantu penemuan event di listing.">
        <div className="grid gap-2 sm:grid-cols-2">
          {(tagsQuery.data ?? []).map((tag) => (
            <label key={tag.id} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Checkbox
                checked={selectedTagIds.includes(String(tag.id))}
                onCheckedChange={() => toggleTag(String(tag.id))}
              />
              {tag.name}
            </label>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            placeholder="Tag baru, mis. musik"
            className="h-10"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => void handleCreateTag()} disabled={createTagMutation.isPending}>
            <Plus className="size-4" />
            Tambah
          </Button>
        </div>
      </FormField>
    </div>
  );
}

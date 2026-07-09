"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { EventSubNav } from "@/components/features/events/event-sub-nav";
import { routes } from "@/config/env";
import { useEventQuery } from "@/hooks/use-events";
import { useRegistrationFormQuery, useSyncRegistrationFieldsMutation } from "@/hooks/use-phase-c";
import type { RegistrationField, RegistrationFieldType } from "@/types/phase-c";

const fieldTypes: RegistrationFieldType[] = ["text", "email", "phone", "textarea", "select", "checkbox"];

function emptyField(sortOrder: number): RegistrationField {
  return {
    label: "",
    name: "",
    type: "text",
    is_required: false,
    sort_order: sortOrder,
    is_active: true,
    options: [],
  };
}

interface EventRegistrationPanelProps {
  eventUuid: string;
}

export function EventRegistrationPanel({ eventUuid }: EventRegistrationPanelProps) {
  const eventQuery = useEventQuery(eventUuid);
  const formQuery = useRegistrationFormQuery(eventUuid);
  const syncMutation = useSyncRegistrationFieldsMutation(eventUuid);
  const [fields, setFields] = useState<RegistrationField[]>([emptyField(0)]);

  useEffect(() => {
    if (formQuery.data) {
      setFields(formQuery.data.fields.length > 0 ? formQuery.data.fields : [emptyField(0)]);
    }
  }, [formQuery.data]);

  function updateField(index: number, patch: Partial<RegistrationField>) {
    setFields((current) => current.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field)));
  }

  function addField() {
    setFields((current) => [...current, emptyField(current.length)]);
  }

  function removeField(index: number) {
    setFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index));
  }

  async function handleSave() {
    await syncMutation.mutateAsync(
      fields
        .filter((field) => field.label.trim())
        .map((field, index) => ({
          ...field,
          sort_order: index,
          options: field.type === "select" ? field.options ?? [] : [],
        })),
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={routes.organizerEvents}>
          <ArrowLeft className="size-4" />
          Kembali ke event
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Formulir pendaftaran</h1>
        <p className="text-sm text-muted-foreground">
          Kustomisasi pertanyaan tambahan saat checkout untuk event {eventQuery.data?.title ?? ""}.
        </p>
      </div>

      <EventSubNav eventUuid={eventUuid} eventStatus={eventQuery.data?.status} />

      <FormSectionCard title="Field pendaftaran">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="rounded-xl border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id={`field-label-${index}`} label="Label">
                  <Input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} />
                </FormField>
                <FormField id={`field-type-${index}`} label="Tipe">
                  <Select
                    value={field.type}
                    onChange={(event) =>
                      updateField(index, { type: event.target.value as RegistrationFieldType })
                    }
                  >
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField id={`field-placeholder-${index}`} label="Placeholder" className="sm:col-span-2">
                  <Input
                    value={field.placeholder ?? ""}
                    onChange={(event) => updateField(index, { placeholder: event.target.value })}
                  />
                </FormField>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.is_required}
                    onCheckedChange={(checked) => updateField(index, { is_required: checked === true })}
                  />
                  Wajib diisi
                </label>
              </div>
              {field.type === "select" ? (
                <FormField id={`field-options-${index}`} label="Opsi (pisahkan dengan koma)" className="mt-4">
                  <Input
                    value={(field.options ?? []).map((option) => option.label).join(", ")}
                    onChange={(event) =>
                      updateField(index, {
                        options: event.target.value
                          .split(",")
                          .map((label) => label.trim())
                          .filter(Boolean)
                          .map((label) => ({ label, value: label })),
                      })
                    }
                  />
                </FormField>
              ) : null}
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => removeField(index)}>
                  <Trash2 className="size-4" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addField}>
            <Plus className="size-4" />
            Tambah field
          </Button>
        </div>
      </FormSectionCard>

      <div className="flex justify-end">
        <Button className="bg-brand hover:bg-brand-hover" disabled={syncMutation.isPending} onClick={() => void handleSave()}>
          {syncMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan formulir"
          )}
        </Button>
      </div>
    </div>
  );
}

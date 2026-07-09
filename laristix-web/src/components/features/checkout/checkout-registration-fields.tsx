"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { RegistrationField } from "@/types/phase-c";

interface CheckoutRegistrationFieldsProps {
  fields: RegistrationField[];
  values: Record<number, string | boolean>;
  onChange: (fieldId: number, value: string | boolean) => void;
}

export function CheckoutRegistrationFields({
  fields,
  values,
  onChange,
}: CheckoutRegistrationFieldsProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Informasi tambahan</h3>
      {fields.map((field) => {
        if (!field.id) {
          return null;
        }

        const value = values[field.id];

        if (field.type === "textarea") {
          return (
            <FormField key={field.id} id={`registration-field-${field.id}`} label={field.label} required={field.is_required}>
              <Textarea
                value={typeof value === "string" ? value : ""}
                onChange={(event) => onChange(field.id!, event.target.value)}
              />
            </FormField>
          );
        }

        if (field.type === "select") {
          return (
            <FormField key={field.id} id={`registration-field-${field.id}`} label={field.label} required={field.is_required}>
              <Select
                value={typeof value === "string" ? value : ""}
                onChange={(event) => onChange(field.id!, event.target.value)}
              >
                <option value="">Pilih...</option>
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label key={field.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value === true}
                onCheckedChange={(checked) => onChange(field.id!, checked === true)}
              />
              {field.label}
            </label>
          );
        }

        return (
          <FormField key={field.id} id={`registration-field-${field.id}`} label={field.label} required={field.is_required}>
            <Input
              type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(field.id!, event.target.value)}
            />
          </FormField>
        );
      })}
    </div>
  );
}

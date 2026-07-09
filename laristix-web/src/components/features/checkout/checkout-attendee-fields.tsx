"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { CheckoutRegistrationFields } from "@/components/features/checkout/checkout-registration-fields";
import type { RegistrationField } from "@/types/phase-c";
import type { CheckoutAttendeePayload } from "@/lib/event-checkout-settings";

interface CheckoutAttendeeFieldsProps {
  quantity: number;
  attendees: CheckoutAttendeePayload[];
  registrationFields: RegistrationField[];
  onChange: (index: number, patch: Partial<CheckoutAttendeePayload>) => void;
  onAnswerChange: (index: number, fieldId: number, value: string | boolean) => void;
}

export function CheckoutAttendeeFields({
  quantity,
  attendees,
  registrationFields,
  onChange,
  onAnswerChange,
}: CheckoutAttendeeFieldsProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: quantity }, (_, index) => {
        const attendee = attendees[index] ?? { name: "" };
        const answers = Object.fromEntries(
          (attendee.answers ?? []).map((answer) => [answer.field_id, answer.value ?? ""]),
        ) as Record<number, string | boolean>;

        return (
          <div key={index} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="mb-4 font-medium">Data pemegang tiket #{index + 1}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id={`attendee-name-${index}`} label="Nama lengkap" required className="sm:col-span-2">
                <Input
                  id={`attendee-name-${index}`}
                  value={attendee.name}
                  onChange={(event) => onChange(index, { name: event.target.value })}
                  required
                />
              </FormField>
              <FormField id={`attendee-email-${index}`} label="Email">
                <Input
                  id={`attendee-email-${index}`}
                  type="email"
                  value={attendee.email ?? ""}
                  onChange={(event) => onChange(index, { email: event.target.value })}
                />
              </FormField>
              <FormField id={`attendee-phone-${index}`} label="No. telepon">
                <Input
                  id={`attendee-phone-${index}`}
                  value={attendee.phone ?? ""}
                  onChange={(event) => onChange(index, { phone: event.target.value })}
                />
              </FormField>
              <FormField id={`attendee-id-${index}`} label="No. KTP">
                <Input
                  id={`attendee-id-${index}`}
                  value={attendee.id_number ?? ""}
                  onChange={(event) => onChange(index, { id_number: event.target.value })}
                />
              </FormField>
              <FormField id={`attendee-dob-${index}`} label="Tanggal lahir">
                <Input
                  id={`attendee-dob-${index}`}
                  type="date"
                  value={attendee.date_of_birth ?? ""}
                  onChange={(event) => onChange(index, { date_of_birth: event.target.value })}
                />
              </FormField>
              <FormField id={`attendee-gender-${index}`} label="Jenis kelamin" className="sm:col-span-2">
                <Select
                  value={attendee.gender ?? ""}
                  onChange={(event) => onChange(index, { gender: event.target.value || undefined })}
                >
                  <option value="">Pilih</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="other">Lainnya</option>
                </Select>
              </FormField>
            </div>
            {registrationFields.length > 0 ? (
              <div className="mt-4">
                <CheckoutRegistrationFields
                  fields={registrationFields}
                  values={answers}
                  onChange={(fieldId, value) => onAnswerChange(index, fieldId, value)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

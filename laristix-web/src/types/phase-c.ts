export interface EventTag {
  id: number;
  organizer_id: number | null;
  name: string;
  slug: string;
  is_global: boolean;
}

export type RegistrationFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox";

export interface RegistrationFieldOption {
  id?: number;
  label: string;
  value: string;
  sort_order?: number;
}

export interface RegistrationField {
  id?: number;
  label: string;
  name: string;
  type: RegistrationFieldType;
  placeholder?: string | null;
  help_text?: string | null;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  options?: RegistrationFieldOption[];
}

export interface RegistrationForm {
  id?: number;
  event_id: number;
  title: string;
  description?: string | null;
  is_active: boolean;
  fields: RegistrationField[];
}

export interface OrganizerComplianceProfile {
  type: "individual" | "business" | null;
  ktp_number: string | null;
  npwp_number: string | null;
  legal_name: string | null;
  status: "not_submitted" | "pending" | "verified" | "rejected";
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
}

export interface SubmitOrganizerCompliancePayload {
  type: "individual" | "business";
  legal_name: string;
  ktp_number?: string;
  npwp_number?: string;
}

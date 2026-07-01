export type UserRole =
  | "super_admin"
  | "organizer"
  | "staff"
  | "participant";

export interface OrganizerMembership {
  id: number;
  role: string;
}

export interface OrganizerSummary {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: string;
  membership: OrganizerMembership | null;
}

export interface AuthenticatedUser {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  roles: UserRole[];
  primary_role: UserRole;
  active_organizer: OrganizerSummary | null;
  active_membership: OrganizerMembership | null;
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface SwitchOrganizerPayload {
  organizer_id: number;
}

export interface CreateOrganizerPayload {
  name: string;
  email: string;
  slug?: string;
  phone?: string;
  description?: string;
  website?: string;
  country_code?: string;
  currency?: string;
  timezone?: string;
}

export interface Organizer {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  country_code: string;
  currency: string;
  timezone: string;
  status: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

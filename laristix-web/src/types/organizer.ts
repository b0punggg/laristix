import type { PaginatedMeta } from "@/types/event";

export type OrganizerStatus = "pending" | "active" | "suspended" | "archived";

export interface OrganizerOwnerSummary {
  name: string;
  email: string;
}

export interface OrganizerApprovedBySummary {
  id: number;
  name: string;
  email: string;
}

export interface AdminOrganizer {
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
  status: OrganizerStatus;
  events_count?: number;
  owner?: OrganizerOwnerSummary | null;
  approved_at: string | null;
  approved_by?: OrganizerApprovedBySummary | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrganizerListFilters {
  status?: OrganizerStatus;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedOrganizerResponse {
  data: AdminOrganizer[];
  meta: PaginatedMeta;
}

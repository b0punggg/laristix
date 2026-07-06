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

export interface OrganizerDashboardSummary {
  totals: {
    events: number;
    events_published: number;
    events_draft: number;
    orders_completed: number;
    tickets_sold: number;
    registrations: number;
    check_ins: number;
    revenue_gross: number;
    revenue_net: number;
    platform_fees: number;
  };
  today: {
    orders: number;
    registrations: number;
    revenue_gross: number;
    revenue_net: number;
    check_ins: number;
  };
}

export interface OrganizerTrendPoint {
  date: string;
  orders: number;
  revenue_gross: number;
  revenue_net: number;
  platform_fees: number;
  check_ins: number;
}

export interface OrganizerDashboardTrends {
  days: number;
  series: OrganizerTrendPoint[];
}

export interface OrganizerEventInsight {
  uuid: string;
  title: string;
  status: string;
  start_at: string;
  end_at: string;
  timezone: string;
  is_free: boolean;
  venue_city: string | null;
}

export type OrganizerAttentionType =
  | "draft_pending_publish"
  | "no_ticket_types"
  | "no_check_in_gates";

export interface OrganizerAttentionItem {
  type: OrganizerAttentionType;
  message: string;
  event: OrganizerEventInsight;
}

export interface OrganizerTopEventByRevenue {
  event: OrganizerEventInsight;
  revenue_net: number;
  revenue_gross: number;
  orders_count: number;
}

export interface OrganizerDashboardInsights {
  check_in_today: {
    count: number;
  };
  upcoming_events: OrganizerEventInsight[];
  attention_items: OrganizerAttentionItem[];
  top_events_by_revenue: OrganizerTopEventByRevenue[];
}

export interface OrganizerScannerDashboardSummary {
  today: {
    scans: number;
    last_scan_at: string | null;
  };
  events_today: Array<{
    event: OrganizerEventInsight;
    scans_today: number;
  }>;
}

export type OrganizerMemberRole = "owner" | "admin" | "staff" | "scanner";
export type OrganizerMemberStatus = "pending" | "active" | "removed";

export interface OrganizerMemberUser {
  id: number;
  uuid: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface OrganizerMember {
  id: number;
  organizer_id: number;
  role: OrganizerMemberRole;
  status: OrganizerMemberStatus;
  invited_at: string | null;
  accepted_at: string | null;
  user?: OrganizerMemberUser;
  invited_by?: { id: number; name: string } | null;
  created_at?: string;
}

export interface OrganizerInvitation {
  id: number;
  role: OrganizerMemberRole;
  status: OrganizerMemberStatus;
  invited_at: string | null;
  organizer: {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    logo_url: string | null;
    status: string;
  } | null;
  invited_by?: { id: number; name: string } | null;
}

export interface InviteOrganizerMemberPayload {
  email: string;
  role: Exclude<OrganizerMemberRole, "owner">;
}

export interface UpdateOrganizerMemberPayload {
  role?: OrganizerMemberRole;
  status?: OrganizerMemberStatus;
}

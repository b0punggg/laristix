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

export interface EventDashboardEventSummary {
  uuid: string;
  title: string;
  status: string;
  start_at: string;
  end_at: string;
  timezone: string;
  is_free: boolean;
}

export interface EventDashboardSummary {
  event: EventDashboardEventSummary;
  totals: {
    orders_completed: number;
    tickets_sold: number;
    tickets_remaining: number;
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

export interface EventDashboardTrends {
  days: number;
  series: OrganizerTrendPoint[];
}

export type EventAttentionType = "tickets_low_stock" | "no_check_in_gates";

export interface EventAttentionItem {
  type: EventAttentionType;
  message: string;
  ticket_type_id?: number;
  ticket_type_name?: string;
}

export interface EventTicketBreakdown {
  ticket_type_id: number;
  name: string;
  sold: number;
  quantity: number;
  remaining: number;
  revenue_gross: number;
}

export interface EventRecentOrder {
  uuid: string;
  order_number: string;
  buyer_name: string;
  buyer_email: string;
  status: string;
  total_amount: number;
  organizer_net_amount: number;
  paid_at: string | null;
}

export interface EventDashboardInsights {
  ticket_breakdown: EventTicketBreakdown[];
  recent_orders: EventRecentOrder[];
  check_in_today: {
    count: number;
  };
  attention_items: EventAttentionItem[];
}

export interface EventAttendeeCustomAnswer {
  field_id: number;
  label: string;
  name: string;
  value: string | boolean | number | null;
}

export interface EventAttendeeOrder {
  uuid: string;
  order_number: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_id_number: string | null;
  buyer_date_of_birth: string | null;
  buyer_gender: string | null;
  status: string;
  paid_at: string | null;
  completed_at: string | null;
  created_at: string | null;
}

export interface EventAttendee {
  uuid: string;
  seat_index: number;
  attendee_name: string | null;
  attendee_email: string | null;
  attendee_phone: string | null;
  id_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  status: string;
  ticket_type_name: string | null;
  ticket_code: string | null;
  checked_in_at: string | null;
  order: EventAttendeeOrder | null;
  custom_answers: EventAttendeeCustomAnswer[];
  created_at: string | null;
}

export interface EventAttendeesFilters {
  search?: string;
  order_status?: string;
  per_page?: number;
  page?: number;
}

export interface EventAttendeesResponse {
  data: EventAttendee[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EventOrderTicketDetail {
  uuid: string;
  seat_index: number;
  attendee_name: string | null;
  attendee_email: string | null;
  attendee_phone: string | null;
  id_number: string | null;
  ticket_type_name: string | null;
  ticket_code: string | null;
  ticket_status: string | null;
  checked_in_at: string | null;
  registration_status: string;
  custom_answers: Array<{ label: string; value: unknown }>;
}

export interface EventOrderDetail {
  uuid: string;
  order_number: string;
  created_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  status: string;
  transaction_type: "free" | "paid";
  transaction_type_label: string;
  purchase_source: string;
  invoice_status: string;
  invoice_status_label: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_id_number: string | null;
  buyer_date_of_birth: string | null;
  buyer_gender: string | null;
  currency: string;
  subtotal: number;
  discount_amount: number;
  platform_fee_total: number;
  total_amount: number;
  organizer_net_amount: number;
  fee_bearer: string;
  promo_code: string | null;
  coupon_code: string | null;
  items: Array<{
    ticket_type_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  tickets: EventOrderTicketDetail[];
  payment: {
    gateway: string;
    payment_method: string | null;
    status: string;
    amount: number;
    paid_at: string | null;
  } | null;
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

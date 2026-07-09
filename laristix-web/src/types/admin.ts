export interface MaintenanceModeSetting {
  enabled: boolean;
  message: string;
}

export interface DefaultPlatformFeeSetting {
  fee_type: "percentage" | "flat" | "both";
  percentage_rate: number;
  flat_amount: number;
  fee_bearer: "attendee" | "organizer";
}

export interface PlatformSetting {
  key: string;
  value: MaintenanceModeSetting | DefaultPlatformFeeSetting | Record<string, unknown>;
  description: string | null;
  updated_at: string | null;
}

export type FeeType = "percentage" | "flat" | "both";
export type FeeBearer = "attendee" | "organizer";

export interface OrganizerFeeConfig {
  id: number;
  organizer_id: number;
  fee_type: FeeType;
  percentage_rate: number;
  flat_amount: number;
  fee_bearer: FeeBearer;
  effective_from: string;
  effective_until: string | null;
  notes: string | null;
  created_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface StoreOrganizerFeeConfigPayload {
  fee_type: FeeType;
  percentage_rate: number;
  flat_amount: number;
  fee_bearer: FeeBearer;
  effective_from: string;
  effective_until?: string | null;
  notes?: string | null;
}

export interface AdminDashboardSummary {
  totals: {
    events: number;
    organizers_active: number;
    organizers_pending: number;
    orders_completed: number;
    tickets_sold: number;
    registrations: number;
    check_ins: number;
    revenue_gross: number;
    platform_fees: number;
  };
  today: {
    orders: number;
    revenue_gross: number;
    check_ins: number;
  };
}

export interface AnalyticsTrendPoint {
  date: string;
  orders: number;
  revenue_gross: number;
  platform_fees: number;
  check_ins: number;
}

export interface AnalyticsTrends {
  days: number;
  series: AnalyticsTrendPoint[];
}

export interface ActivityLogEntry {
  id: number;
  action: string;
  subject_type: string;
  subject_id: number;
  properties: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
  organizer?: { id: number; name: string; slug: string } | null;
}

export interface AuditLogEntry {
  id: number;
  category: string;
  event: string;
  auditable_type: string | null;
  auditable_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
  organizer?: { id: number; name: string; slug: string } | null;
}

export interface LogListFilters {
  action?: string;
  category?: string;
  event?: string;
  page?: number;
  per_page?: number;
}

export interface AdminWithdrawalEventSummary {
  uuid: string;
  title: string;
}

export interface AdminWithdrawalOrganizerSummary {
  uuid: string;
  name: string;
  slug: string;
}

export interface AdminWithdrawal {
  uuid: string;
  amount: number;
  status: "pending" | "processing" | "paid" | "rejected";
  bank_name: string;
  account_holder: string;
  account_number: string;
  invoice_number: string | null;
  invoice_url: string | null;
  supporting_document_url: string | null;
  transfer_proof_url: string | null;
  status_history: Array<{
    status: string;
    label: string;
    at: string;
    notes: string | null;
  }>;
  notes: string | null;
  requested_at: string | null;
  processed_at: string | null;
  created_at: string | null;
  event: AdminWithdrawalEventSummary | null;
  organizer: AdminWithdrawalOrganizerSummary | null;
}

export interface UpdateAdminWithdrawalPayload {
  status: "pending" | "processing" | "paid" | "rejected";
  notes?: string | null;
  invoice_number?: string | null;
  invoice_url?: string | null;
  supporting_document_url?: string | null;
  transfer_proof_url?: string | null;
}

export type AdminWithdrawalDocumentType =
  | "invoice"
  | "supporting_document"
  | "transfer_proof";

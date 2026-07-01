export type TicketKind = "free" | "paid" | "vip";

export type TicketTypeStatus = "active" | "sold_out" | "hidden" | "archived";

export type TicketVisibility = "public" | "hidden" | "invite_only";

export interface TicketManagementFlags {
  can_edit: boolean;
  can_delete: boolean;
}

export interface TicketType {
  id: number;
  event_id: number;
  organizer_id: number;
  name: string;
  kind: TicketKind;
  description: string | null;
  price: number;
  currency: string;
  quantity: number;
  sold_count: number;
  reserved_count: number;
  available_quantity: number;
  min_per_order: number;
  max_per_order: number;
  sales_start_at: string | null;
  sales_end_at: string | null;
  visibility: TicketVisibility;
  sort_order: number;
  status: TicketTypeStatus;
  is_free: boolean;
  is_sold_out: boolean;
  is_sales_open: boolean;
  is_purchasable: boolean;
  management?: TicketManagementFlags;
  created_at: string;
  updated_at: string;
}

export interface TicketListFilters {
  status?: TicketTypeStatus;
  kind?: TicketKind;
}

export interface CreateTicketPayload {
  kind: TicketKind;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  quantity: number;
  min_per_order?: number;
  max_per_order?: number;
  sales_start_at?: string | null;
  sales_end_at?: string | null;
  visibility?: TicketVisibility;
  sort_order?: number;
}

export interface UpdateTicketPayload {
  name?: string;
  description?: string | null;
  price?: number;
  currency?: string;
  quantity?: number;
  min_per_order?: number;
  max_per_order?: number;
  sales_start_at?: string | null;
  sales_end_at?: string | null;
  visibility?: TicketVisibility;
  sort_order?: number;
  status?: TicketTypeStatus;
}

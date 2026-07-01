export type EventStatus = "draft" | "published" | "live" | "completed" | "cancelled";

export type EventVisibility = "public" | "private" | "unlisted";

export interface EventManagementFlags {
  can_edit: boolean;
  can_publish: boolean;
  can_draft: boolean;
  can_delete: boolean;
}

export interface EventVenue {
  id: number;
  name: string;
  type: string;
  city: string | null;
}

export interface EventCategory {
  id: number;
  organizer_id: number | null;
  name: string;
  slug: string;
  icon: string | null;
  is_global: boolean;
}

export interface EventOrganizerSummary {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface Event {
  id: number;
  uuid: string;
  organizer_id: number;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  banner_url: string | null;
  status: EventStatus;
  visibility: EventVisibility;
  start_at: string;
  end_at: string;
  timezone: string;
  capacity: number | null;
  is_free: boolean;
  settings: Record<string, unknown> | null;
  published_at: string | null;
  venue?: EventVenue | null;
  category?: EventCategory | null;
  organizer?: EventOrganizerSummary | null;
  management?: EventManagementFlags;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface EventListFilters {
  status?: EventStatus;
  search?: string;
  per_page?: number;
}

export interface PublicEventListFilters {
  search?: string;
  category_id?: number;
  per_page?: number;
  page?: number;
}

export interface AdminEventListFilters extends EventListFilters {
  organizer_id?: number;
}

export interface CreateEventPayload {
  title: string;
  slug?: string;
  description?: string;
  short_description?: string;
  venue_id?: number | null;
  category_id?: number | null;
  start_at: string;
  end_at: string;
  timezone: string;
  capacity?: number | null;
  is_free?: boolean;
  visibility?: EventVisibility;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string | null;
  short_description?: string | null;
  banner_url?: string | null;
  venue_id?: number | null;
  category_id?: number | null;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  capacity?: number | null;
  is_free?: boolean;
  visibility?: EventVisibility;
}

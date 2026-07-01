import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type {
  AdminEventListFilters,
  CreateEventPayload,
  Event,
  EventCategory,
  EventListFilters,
  EventVenue,
  PaginatedResponse,
  PublicEventListFilters,
  UpdateEventPayload,
} from "@/types/event";

export const eventApi = {
  async list(filters: EventListFilters = {}) {
    const { data } = await apiClient.get<PaginatedResponse<Event>>(apiPaths.events.list, {
      params: filters,
    });
    return data;
  },

  async listAdmin(filters: AdminEventListFilters = {}) {
    const { data } = await apiClient.get<PaginatedResponse<Event>>(apiPaths.events.adminList, {
      params: filters,
    });
    return data;
  },

  async show(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<Event>>(apiPaths.events.show(uuid));
    return data.data;
  },

  async create(payload: CreateEventPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<Event>>(apiPaths.events.create, payload);
    return data;
  },

  async update(uuid: string, payload: UpdateEventPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<ApiResponse<Event>>(
      apiPaths.events.update(uuid),
      payload,
    );
    return data;
  },

  async delete(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.delete<{ message: string }>(apiPaths.events.delete(uuid));
    return data;
  },

  async publish(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<Event>>(apiPaths.events.publish(uuid));
    return data;
  },

  async draft(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<Event>>(apiPaths.events.draft(uuid));
    return data;
  },

  async venues() {
    const { data } = await apiClient.get<ApiResponse<EventVenue[]>>(apiPaths.venues.list);
    return data.data;
  },

  async categories() {
    const { data } = await apiClient.get<ApiResponse<EventCategory[]>>(apiPaths.eventCategories);
    return data.data;
  },

  async listPublic(filters: PublicEventListFilters = {}) {
    const { data } = await apiClient.get<PaginatedResponse<Event>>(apiPaths.events.publicList, {
      params: filters,
    });
    return data;
  },

  async showPublic(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<Event>>(apiPaths.events.publicShow(uuid));
    return data.data;
  },
};

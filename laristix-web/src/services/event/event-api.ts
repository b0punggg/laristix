import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type {
  AdminEventListFilters,
  CreateEventPayload,
  CreateVenuePayload,
  Event,
  EventCategory,
  EventListFilters,
  EventVenue,
  FeaturedOrganizer,
  PaginatedResponse,
  PublicCity,
  PublicCreatorProfile,
  PublicEventListFilters,
  UpdateEventPayload,
} from "@/types/event";
import type {
  CreateEventPromoCodePayload,
  CreateEventWithdrawalPayload,
  EventAttendeesFilters,
  EventAttendeesResponse,
  EventDashboardInsights,
  EventDashboardSummary,
  EventDashboardTrends,
  EventOrderDetail,
  EventPromoCode,
  EventWithdrawal,
  EventWithdrawalListResponse,
} from "@/types/organizer";

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

  async uploadBanner(file: File) {
    await ensureCsrfCookie();
    const formData = new FormData();
    formData.append("banner", file);

    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      apiPaths.events.bannerUpload,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data.data.url;
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

  async dashboardSummary(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<EventDashboardSummary>>(
      apiPaths.events.dashboardSummary(uuid),
    );
    return data.data;
  },

  async dashboardTrends(uuid: string, days = 30) {
    const { data } = await apiClient.get<ApiResponse<EventDashboardTrends>>(
      apiPaths.events.dashboardTrends(uuid),
      { params: { days } },
    );
    return data.data;
  },

  async dashboardInsights(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<EventDashboardInsights>>(
      apiPaths.events.dashboardInsights(uuid),
    );
    return data.data;
  },

  async attendees(uuid: string, filters: EventAttendeesFilters = {}) {
    const { data } = await apiClient.get<EventAttendeesResponse>(
      apiPaths.events.attendees(uuid),
      { params: filters },
    );
    return data;
  },

  async eventOrder(eventUuid: string, orderUuid: string) {
    const { data } = await apiClient.get<ApiResponse<EventOrderDetail>>(
      apiPaths.events.orderShow(eventUuid, orderUuid),
    );
    return data.data;
  },

  async promoCodes(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<EventPromoCode[]>>(apiPaths.events.promoCodes(uuid));
    return data.data;
  },

  async createPromoCode(uuid: string, payload: CreateEventPromoCodePayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<EventPromoCode>>(
      apiPaths.events.promoCodes(uuid),
      payload,
    );
    return data.data;
  },

  async withdrawals(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<EventWithdrawalListResponse>>(
      apiPaths.events.withdrawals(uuid),
    );
    return data.data;
  },

  async createWithdrawal(uuid: string, payload: CreateEventWithdrawalPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<EventWithdrawal>>(
      apiPaths.events.withdrawals(uuid),
      payload,
    );
    return data.data;
  },

  async venues() {
    const { data } = await apiClient.get<ApiResponse<EventVenue[]>>(apiPaths.venues.list);
    return data.data;
  },

  async createVenue(payload: CreateVenuePayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<EventVenue>>(apiPaths.venues.create, payload);
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

  async listPublicCategories() {
    const { data } = await apiClient.get<ApiResponse<EventCategory[]>>(
      apiPaths.events.publicCategories,
    );
    return data.data;
  },

  async listPublicCities() {
    const { data } = await apiClient.get<ApiResponse<PublicCity[]>>(apiPaths.events.publicCities);
    return data.data;
  },

  async getPublicStats() {
    const { data } = await apiClient.get<
      ApiResponse<{ published_events_count: number; organizer_count: number }>
    >(apiPaths.events.publicStats);
    return data.data;
  },

  async listFeaturedOrganizers() {
    const { data } = await apiClient.get<ApiResponse<FeaturedOrganizer[]>>(
      apiPaths.events.publicFeaturedOrganizers,
    );
    return data.data;
  },

  async showPublic(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<Event>>(apiPaths.events.publicShow(uuid));
    return data.data;
  },

  async showPublicCreator(slug: string) {
    const { data } = await apiClient.get<ApiResponse<PublicCreatorProfile>>(
      apiPaths.events.publicCreator(slug),
    );
    return data.data;
  },
};

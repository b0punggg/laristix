import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type {
  CreateTicketPayload,
  TicketListFilters,
  TicketType,
  UpdateTicketPayload,
} from "@/types/ticket";

export const publicTicketApi = {
  async list(eventUuid: string) {
    const { data } = await apiClient.get<ApiResponse<TicketType[]>>(
      apiPaths.ticketTypes.publicList(eventUuid),
    );
    return data.data;
  },
};

export const ticketApi = {
  async list(eventUuid: string, filters: TicketListFilters = {}) {
    const { data } = await apiClient.get<ApiResponse<TicketType[]>>(
      apiPaths.ticketTypes.list(eventUuid),
      { params: filters },
    );
    return data.data;
  },

  async show(eventUuid: string, ticketTypeId: number) {
    const { data } = await apiClient.get<ApiResponse<TicketType>>(
      apiPaths.ticketTypes.show(eventUuid, ticketTypeId),
    );
    return data.data;
  },

  async create(eventUuid: string, payload: CreateTicketPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<TicketType>>(
      apiPaths.ticketTypes.create(eventUuid),
      payload,
    );
    return data;
  },

  async update(eventUuid: string, ticketTypeId: number, payload: UpdateTicketPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<ApiResponse<TicketType>>(
      apiPaths.ticketTypes.update(eventUuid, ticketTypeId),
      payload,
    );
    return data;
  },

  async delete(eventUuid: string, ticketTypeId: number) {
    await ensureCsrfCookie();
    const { data } = await apiClient.delete<{ message: string }>(
      apiPaths.ticketTypes.delete(eventUuid, ticketTypeId),
    );
    return data;
  },
};

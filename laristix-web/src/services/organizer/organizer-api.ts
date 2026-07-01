import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse, CreateOrganizerPayload, Organizer } from "@/types/auth";

export const organizerApi = {
  async create(payload: CreateOrganizerPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<Organizer>>(
      apiPaths.organizers.create,
      payload,
    );
    return data;
  },
};

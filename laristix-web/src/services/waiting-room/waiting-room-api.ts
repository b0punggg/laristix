import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type { JoinWaitingRoomPayload, WaitingRoomState } from "@/types/waiting-room";

export const waitingRoomApi = {
  async status(eventUuid: string, sessionToken?: string) {
    const params = new URLSearchParams();
    if (sessionToken) {
      params.set("session_token", sessionToken);
    }

    const query = params.toString();
    const url = query
      ? `${apiPaths.waitingRoom.status(eventUuid)}?${query}`
      : apiPaths.waitingRoom.status(eventUuid);

    const { data } = await apiClient.get<ApiResponse<WaitingRoomState>>(url);
    return data.data;
  },

  async join(eventUuid: string, payload: JoinWaitingRoomPayload = {}) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<WaitingRoomState>>(
      apiPaths.waitingRoom.join(eventUuid),
      payload,
    );
    return data.data;
  },
};

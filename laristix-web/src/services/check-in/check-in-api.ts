import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { PaginatedResponse } from "@/types/event";
import type {
  AttendanceStats,
  CheckInGate,
  CheckInRecord,
  CheckInVerifyResult,
  TicketQrPayload,
} from "@/types/check-in";

export const checkInApi = {
  async listGates(eventUuid: string) {
    const { data } = await apiClient.get<{ data: CheckInGate[] }>(
      apiPaths.checkIn.gates(eventUuid),
    );
    return data.data;
  },

  async verify(eventUuid: string, qrToken: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ data: CheckInVerifyResult }>(
      apiPaths.checkIn.verify(eventUuid),
      { qr_token: qrToken },
    );
    return data.data;
  },

  async scan(eventUuid: string, payload: { qr_token: string; gate_id?: number }) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ message: string; data: CheckInRecord }>(
      apiPaths.checkIn.scan(eventUuid),
      payload,
    );
    return data;
  },

  async manual(eventUuid: string, payload: { ticket_code: string; gate_id?: number }) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ message: string; data: CheckInRecord }>(
      apiPaths.checkIn.manual(eventUuid),
      payload,
    );
    return data;
  },

  async list(eventUuid: string, page = 1) {
    const { data } = await apiClient.get<PaginatedResponse<CheckInRecord>>(
      apiPaths.checkIn.list(eventUuid),
      { params: { page } },
    );
    return data;
  },

  async stats(eventUuid: string) {
    const { data } = await apiClient.get<{ data: AttendanceStats }>(
      apiPaths.checkIn.stats(eventUuid),
    );
    return data.data;
  },

  async ticketQr(ticketUuid: string) {
    const { data } = await apiClient.get<{ data: TicketQrPayload }>(
      apiPaths.checkIn.ticketQr(ticketUuid),
    );
    return data.data;
  },
};

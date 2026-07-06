import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse, CreateOrganizerPayload, Organizer } from "@/types/auth";
import type {
  AdminOrganizer,
  AdminOrganizerListFilters,
  InviteOrganizerMemberPayload,
  OrganizerDashboardSummary,
  OrganizerDashboardTrends,
  OrganizerDashboardInsights,
  OrganizerMember,
  OrganizerScannerDashboardSummary,
  PaginatedOrganizerResponse,
  UpdateOrganizerMemberPayload,
} from "@/types/organizer";

export const organizerApi = {
  async dashboardSummary() {
    const { data } = await apiClient.get<ApiResponse<OrganizerDashboardSummary>>(
      apiPaths.organizers.dashboardSummary,
    );
    return data.data;
  },

  async dashboardTrends(days = 30) {
    const { data } = await apiClient.get<ApiResponse<OrganizerDashboardTrends>>(
      apiPaths.organizers.dashboardTrends,
      { params: { days } },
    );
    return data.data;
  },

  async dashboardInsights() {
    const { data } = await apiClient.get<ApiResponse<OrganizerDashboardInsights>>(
      apiPaths.organizers.dashboardInsights,
    );
    return data.data;
  },

  async dashboardScannerSummary() {
    const { data } = await apiClient.get<ApiResponse<OrganizerScannerDashboardSummary>>(
      apiPaths.organizers.dashboardScannerSummary,
    );
    return data.data;
  },

  async listMembers() {
    const { data } = await apiClient.get<ApiResponse<OrganizerMember[]>>(
      apiPaths.organizers.members,
    );
    return data.data;
  },

  async inviteMember(payload: InviteOrganizerMemberPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<OrganizerMember>>(
      apiPaths.organizers.members,
      payload,
    );
    return data;
  },

  async updateMember(memberId: number, payload: UpdateOrganizerMemberPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<ApiResponse<OrganizerMember>>(
      apiPaths.organizers.member(memberId),
      payload,
    );
    return data;
  },

  async removeMember(memberId: number) {
    await ensureCsrfCookie();
    const { data } = await apiClient.delete<{ message: string }>(
      apiPaths.organizers.member(memberId),
    );
    return data;
  },

  async create(payload: CreateOrganizerPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<Organizer>>(
      apiPaths.organizers.create,
      payload,
    );
    return data;
  },

  async listAdmin(filters: AdminOrganizerListFilters = {}) {
    const { data } = await apiClient.get<PaginatedOrganizerResponse>(
      apiPaths.organizers.adminList,
      { params: filters },
    );
    return data;
  },

  async listPending() {
    const { data } = await apiClient.get<ApiResponse<Organizer[]>>(apiPaths.organizers.adminPending);
    return data.data;
  },

  async showAdmin(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<AdminOrganizer>>(
      apiPaths.organizers.adminShow(uuid),
    );
    return data.data;
  },

  async approve(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<Organizer>>(
      apiPaths.organizers.adminApprove(uuid),
    );
    return data;
  },

  async reject(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<AdminOrganizer>>(
      apiPaths.organizers.adminReject(uuid),
    );
    return data;
  },

  async suspend(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<ApiResponse<AdminOrganizer>>(
      apiPaths.organizers.adminSuspend(uuid),
    );
    return data;
  },

  async activate(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<ApiResponse<AdminOrganizer>>(
      apiPaths.organizers.adminActivate(uuid),
    );
    return data;
  },
};

import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type {
  ActivityLogEntry,
  AdminWithdrawal,
  AdminWithdrawalDocumentType,
  AdminDashboardSummary,
  AnalyticsTrends,
  AuditLogEntry,
  DefaultPlatformFeeSetting,
  LogListFilters,
  MaintenanceModeSetting,
  OrganizerFeeConfig,
  PlatformSetting,
  StoreOrganizerFeeConfigPayload,
  UpdateAdminWithdrawalPayload,
} from "@/types/admin";
import type { PaginatedResponse } from "@/types/event";
import { fetchAllPaginated } from "@/lib/fetch-paginated-all";

export const adminApi = {
  async listSettings() {
    const { data } = await apiClient.get<ApiResponse<PlatformSetting[]>>(apiPaths.admin.settings);
    return data.data;
  },

  async updateSetting<T>(key: string, value: T) {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<ApiResponse<PlatformSetting>>(
      apiPaths.admin.setting(key),
      { value },
    );
    return data;
  },

  async dashboardSummary() {
    const { data } = await apiClient.get<ApiResponse<AdminDashboardSummary>>(
      apiPaths.admin.dashboardSummary,
    );
    return data.data;
  },

  async analyticsTrends(days = 30) {
    const { data } = await apiClient.get<ApiResponse<AnalyticsTrends>>(
      apiPaths.admin.analyticsTrends,
      { params: { days } },
    );
    return data.data;
  },

  async listActivityLogs(filters: LogListFilters = {}) {
    const { data } = await apiClient.get<PaginatedResponse<ActivityLogEntry>>(
      apiPaths.admin.activityLogs,
      { params: filters },
    );
    return data;
  },

  async listAuditLogs(filters: LogListFilters = {}) {
    const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>(
      apiPaths.admin.auditLogs,
      { params: filters },
    );
    return data;
  },

  async fetchAllActivityLogs(filters: Omit<LogListFilters, "page" | "per_page"> = {}) {
    return fetchAllPaginated<ActivityLogEntry>((page, perPage) =>
      adminApi.listActivityLogs({ ...filters, page, per_page: perPage }),
    );
  },

  async fetchAllAuditLogs(filters: Omit<LogListFilters, "page" | "per_page"> = {}) {
    return fetchAllPaginated<AuditLogEntry>((page, perPage) =>
      adminApi.listAuditLogs({ ...filters, page, per_page: perPage }),
    );
  },

  async listWithdrawals() {
    const { data } = await apiClient.get<ApiResponse<AdminWithdrawal[]>>(apiPaths.admin.withdrawals);
    return data.data;
  },

  async updateWithdrawal(uuid: string, payload: UpdateAdminWithdrawalPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.patch<ApiResponse<{ uuid: string; status: string }>>(
      apiPaths.admin.withdrawal(uuid),
      payload,
    );
    return data;
  },

  async uploadWithdrawalDocument(uuid: string, type: AdminWithdrawalDocumentType, file: File) {
    await ensureCsrfCookie();
    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", type);

    const { data } = await apiClient.post<ApiResponse<{ type: string; url: string }>>(
      apiPaths.admin.withdrawalDocuments(uuid),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data.data;
  },

  async listOrganizerFeeConfigs(organizerUuid: string) {
    const { data } = await apiClient.get<ApiResponse<OrganizerFeeConfig[]>>(
      apiPaths.admin.organizerFeeConfigs(organizerUuid),
    );
    return data.data;
  },

  async createOrganizerFeeConfig(organizerUuid: string, payload: StoreOrganizerFeeConfigPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<OrganizerFeeConfig>>(
      apiPaths.admin.organizerFeeConfigs(organizerUuid),
      payload,
    );
    return data;
  },

  async deleteOrganizerFeeConfig(organizerUuid: string, feeConfigId: number) {
    await ensureCsrfCookie();
    const { data } = await apiClient.delete<{ message: string }>(
      apiPaths.admin.organizerFeeConfig(organizerUuid, feeConfigId),
    );
    return data;
  },
};

export type { MaintenanceModeSetting, DefaultPlatformFeeSetting };

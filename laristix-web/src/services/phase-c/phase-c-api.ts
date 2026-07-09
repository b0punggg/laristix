import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type { EventTag } from "@/types/event";
import type { RegistrationField, RegistrationForm } from "@/types/phase-c";
import type { OrganizerComplianceProfile, SubmitOrganizerCompliancePayload } from "@/types/phase-c";

export const phaseCApi = {
  async listTags() {
    const { data } = await apiClient.get<ApiResponse<EventTag[]>>(apiPaths.eventTags.list);
    return data.data;
  },

  async createTag(name: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<EventTag>>(apiPaths.eventTags.create, { name });
    return data.data;
  },

  async getCompliance() {
    const { data } = await apiClient.get<ApiResponse<OrganizerComplianceProfile>>(
      apiPaths.organizers.complianceShow,
    );
    return data.data;
  },

  async submitCompliance(payload: SubmitOrganizerCompliancePayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<OrganizerComplianceProfile>>(
      apiPaths.organizers.complianceSubmit,
      payload,
    );
    return data.data;
  },

  async getRegistrationForm(eventUuid: string) {
    const { data } = await apiClient.get<ApiResponse<RegistrationForm>>(
      apiPaths.registrationForms.show(eventUuid),
    );
    return data.data;
  },

  async syncRegistrationFields(eventUuid: string, fields: RegistrationField[]) {
    await ensureCsrfCookie();
    const { data } = await apiClient.put<ApiResponse<RegistrationForm>>(
      apiPaths.registrationForms.sync(eventUuid),
      { fields },
    );
    return data.data;
  },

  async getPublicRegistrationForm(eventUuid: string) {
    const { data } = await apiClient.get<ApiResponse<RegistrationForm>>(
      apiPaths.registrationForms.publicShow(eventUuid),
    );
    return data.data;
  },
};

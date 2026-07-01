import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type {
  ApiResponse,
  AuthenticatedUser,
  ForgotPasswordPayload,
  LoginPayload,
  OrganizerSummary,
  RegisterPayload,
  ResetPasswordPayload,
  SwitchOrganizerPayload,
} from "@/types/auth";

export const authApi = {
  async register(payload: RegisterPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<AuthenticatedUser>>(
      apiPaths.auth.register,
      payload,
    );
    return data;
  },

  async login(payload: LoginPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<AuthenticatedUser>>(
      apiPaths.auth.login,
      payload,
    );
    return data;
  },

  async logout() {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ message: string }>(apiPaths.auth.logout);
    return data;
  },

  async me() {
    const { data } = await apiClient.get<ApiResponse<AuthenticatedUser>>(apiPaths.auth.me);
    return data.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ message: string }>(
      apiPaths.auth.forgotPassword,
      payload,
    );
    return data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ message: string }>(
      apiPaths.auth.resetPassword,
      payload,
    );
    return data;
  },

  async resendVerification() {
    const { data } = await apiClient.post<{ message: string }>(
      apiPaths.auth.verificationNotice,
    );
    return data;
  },

  async resendVerificationPublic(email: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{ message: string }>(
      apiPaths.auth.resendVerification,
      { email },
    );
    return data;
  },

  async verifyEmail(
    id: string,
    hash: string,
    params: { expires: string; signature: string },
  ) {
    const query = `expires=${encodeURIComponent(params.expires)}&signature=${encodeURIComponent(params.signature)}`;

    const { data } = await apiClient.get<{ message: string }>(
      `${apiPaths.auth.verifyEmail(id, hash)}?${query}`,
    );
    return data;
  },

  async organizers() {
    const { data } = await apiClient.get<ApiResponse<OrganizerSummary[]>>(
      apiPaths.auth.organizers,
    );
    return data.data;
  },

  async switchOrganizer(payload: SwitchOrganizerPayload) {
    const { data } = await apiClient.post<ApiResponse<AuthenticatedUser>>(
      apiPaths.auth.switchOrganizer,
      payload,
    );
    return data.data;
  },
};

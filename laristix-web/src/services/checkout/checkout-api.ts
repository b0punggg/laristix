import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type {
  CheckoutResponse,
  CreateCheckoutPayload,
  CheckoutOrder,
  PaymentValidationResult,
} from "@/types/checkout";

export const checkoutApi = {
  async create(eventUuid: string, payload: CreateCheckoutPayload, idempotencyKey?: string) {
    await ensureCsrfCookie();
    const headers = idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined;
    const { data } = await apiClient.post<ApiResponse<CheckoutResponse>>(
      apiPaths.checkout.create(eventUuid),
      payload,
      {
        headers,
      },
    );
    return data.data;
  },

  async getOrder(uuid: string) {
    const { data } = await apiClient.get<ApiResponse<CheckoutOrder>>(apiPaths.checkout.showOrder(uuid));
    return data.data;
  },

  async validatePayment(uuid: string) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{
      data: PaymentValidationResult;
      order: CheckoutOrder;
    }>(apiPaths.checkout.validatePayment(uuid));
    return data;
  },
};

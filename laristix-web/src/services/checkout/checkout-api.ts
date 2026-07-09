import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { ApiResponse } from "@/types/auth";
import type {
  CheckoutResponse,
  CreateCheckoutPayload,
  CheckoutOrder,
  PaymentValidationResult,
  CheckoutQuote,
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

  async quote(eventUuid: string, ticketTypeId: number, quantity: number, promoCode?: string) {
    const params = new URLSearchParams({
      ticket_type_id: String(ticketTypeId),
      quantity: String(quantity),
    });
    if (promoCode) {
      params.set("promo_code", promoCode);
    }
    const { data } = await apiClient.get<ApiResponse<CheckoutQuote>>(
      `${apiPaths.checkout.quote(eventUuid)}?${params.toString()}`,
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

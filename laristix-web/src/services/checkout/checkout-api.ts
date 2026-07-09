import { apiClient, ensureCsrfCookie } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import { getQueueSessionToken } from "@/lib/waiting-room-session";
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
    const queueSession = getQueueSessionToken(eventUuid);
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    if (queueSession) {
      headers["X-Queue-Session"] = queueSession;
    }
    const { data } = await apiClient.post<ApiResponse<CheckoutResponse>>(
      apiPaths.checkout.create(eventUuid),
      payload,
      {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
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
    const queueSession = getQueueSessionToken(eventUuid);
    const headers = queueSession ? { "X-Queue-Session": queueSession } : undefined;
    const { data } = await apiClient.get<ApiResponse<CheckoutQuote>>(
      `${apiPaths.checkout.quote(eventUuid)}?${params.toString()}`,
      { headers },
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

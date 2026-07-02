import { apiClient } from "@/lib/api/client";
import { apiPaths } from "@/config/env";
import type { PaginatedResponse } from "@/types/event";
import type { CheckoutOrder } from "@/types/checkout";

export const myOrdersApi = {
  async list(page = 1, perPage = 15) {
    const { data } = await apiClient.get<PaginatedResponse<CheckoutOrder>>(apiPaths.checkout.listOrders, {
      params: { page, per_page: perPage },
    });
    return data;
  },
};

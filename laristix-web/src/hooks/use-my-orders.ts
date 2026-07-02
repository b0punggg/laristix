"use client";

import { useQuery } from "@tanstack/react-query";
import { myOrdersApi } from "@/services/checkout/my-orders-api";

export const myOrdersKeys = {
  all: ["my-orders"] as const,
  list: (page: number, perPage: number) => ["my-orders", "list", page, perPage] as const,
};

export function useMyOrdersQuery(page = 1, perPage = 15) {
  return useQuery({
    queryKey: myOrdersKeys.list(page, perPage),
    queryFn: () => myOrdersApi.list(page, perPage),
  });
}

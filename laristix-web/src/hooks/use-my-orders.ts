"use client";

import { useQuery } from "@tanstack/react-query";
import { myOrdersApi } from "@/services/checkout/my-orders-api";

export const myOrdersKeys = {
  all: ["my-orders"] as const,
  list: (page: number) => ["my-orders", "list", page] as const,
};

export function useMyOrdersQuery(page = 1) {
  return useQuery({
    queryKey: myOrdersKeys.list(page),
    queryFn: () => myOrdersApi.list(page),
  });
}

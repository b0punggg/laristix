"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { checkoutApi } from "@/services/checkout/checkout-api";
import type { CreateCheckoutPayload } from "@/types/checkout";

export const checkoutKeys = {
  all: ["checkout"] as const,
  order: (uuid: string) => ["checkout", "order", uuid] as const,
  quote: (eventUuid: string, ticketTypeId: number, quantity: number) =>
    ["checkout", "quote", eventUuid, ticketTypeId, quantity] as const,
};

export function useCheckoutQuoteQuery(
  eventUuid: string,
  ticketTypeId: number,
  quantity: number,
  enabled = true,
) {
  return useQuery({
    queryKey: checkoutKeys.quote(eventUuid, ticketTypeId, quantity),
    queryFn: () => checkoutApi.quote(eventUuid, ticketTypeId, quantity),
    enabled: enabled && ticketTypeId > 0 && quantity > 0,
  });
}

export function useCheckoutMutation(eventUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCheckoutPayload) => checkoutApi.create(eventUuid, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(checkoutKeys.order(data.order.uuid), data.order);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useOrderQuery(uuid: string, enabled = true) {
  return useQuery({
    queryKey: checkoutKeys.order(uuid),
    queryFn: () => checkoutApi.getOrder(uuid),
    enabled: enabled && uuid.length > 0,
  });
}

export function useValidatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => checkoutApi.validatePayment(uuid),
    onSuccess: (data, uuid) => {
      queryClient.setQueryData(checkoutKeys.order(uuid), data.order);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { eventApi } from "@/services/event/event-api";
import type { CreateEventPromoCodePayload } from "@/types/organizer";

export const eventPromoCodeKeys = {
  all: ["event-promo-codes"] as const,
  list: (eventUuid: string) => ["event-promo-codes", eventUuid] as const,
};

export function useEventPromoCodesQuery(eventUuid: string) {
  return useQuery({
    queryKey: eventPromoCodeKeys.list(eventUuid),
    queryFn: () => eventApi.promoCodes(eventUuid),
  });
}

export function useCreateEventPromoCodeMutation(eventUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPromoCodePayload) =>
      eventApi.createPromoCode(eventUuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventPromoCodeKeys.list(eventUuid) });
      toast.success("Kode promo berhasil dibuat.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

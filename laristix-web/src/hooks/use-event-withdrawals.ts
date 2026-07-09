"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { eventApi } from "@/services/event/event-api";
import type { CreateEventWithdrawalPayload } from "@/types/organizer";

export const eventWithdrawalKeys = {
  all: ["event-withdrawals"] as const,
  list: (eventUuid: string) => ["event-withdrawals", eventUuid] as const,
};

export function useEventWithdrawalsQuery(eventUuid: string) {
  return useQuery({
    queryKey: eventWithdrawalKeys.list(eventUuid),
    queryFn: () => eventApi.withdrawals(eventUuid),
    enabled: eventUuid.length > 0,
  });
}

export function useCreateEventWithdrawalMutation(eventUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventWithdrawalPayload) => eventApi.createWithdrawal(eventUuid, payload),
    onSuccess: () => {
      toast.success("Permintaan penarikan berhasil dibuat.");
      void queryClient.invalidateQueries({ queryKey: eventWithdrawalKeys.list(eventUuid) });
      void queryClient.invalidateQueries({ queryKey: ["events", eventUuid] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/config/env";
import { getApiErrorMessage } from "@/lib/api/client";
import { ticketApi } from "@/services/ticket/ticket-api";
import type { CreateTicketPayload, TicketListFilters, UpdateTicketPayload } from "@/types/ticket";

export const ticketKeys = {
  all: ["tickets"] as const,
  list: (eventUuid: string, filters: TicketListFilters) =>
    ["tickets", eventUuid, "list", filters] as const,
  detail: (eventUuid: string, ticketTypeId: number) =>
    ["tickets", eventUuid, ticketTypeId] as const,
};

export function useTicketTypesQuery(eventUuid: string, filters: TicketListFilters = {}) {
  return useQuery({
    queryKey: ticketKeys.list(eventUuid, filters),
    queryFn: () => ticketApi.list(eventUuid, filters),
    enabled: eventUuid.length > 0,
  });
}

export function useTicketTypeQuery(eventUuid: string, ticketTypeId: number, enabled = true) {
  return useQuery({
    queryKey: ticketKeys.detail(eventUuid, ticketTypeId),
    queryFn: () => ticketApi.show(eventUuid, ticketTypeId),
    enabled: enabled && eventUuid.length > 0 && ticketTypeId > 0,
  });
}

export function useCreateTicketMutation(eventUuid: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketApi.create(eventUuid, payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Ticket created.");
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      router.push(routes.organizerEventTicketEdit(eventUuid, response.data.id));
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useUpdateTicketMutation(eventUuid: string, ticketTypeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTicketPayload) =>
      ticketApi.update(eventUuid, ticketTypeId, payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Ticket updated.");
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(eventUuid, ticketTypeId) });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteTicketMutation(eventUuid: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (ticketTypeId: number) => ticketApi.delete(eventUuid, ticketTypeId),
    onSuccess: (response) => {
      toast.success(response.message ?? "Ticket deleted.");
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      router.push(routes.organizerEventTickets(eventUuid));
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

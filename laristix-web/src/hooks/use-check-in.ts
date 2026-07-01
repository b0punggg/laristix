"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { checkInApi } from "@/services/check-in/check-in-api";

export const checkInKeys = {
  all: ["check-in"] as const,
  gates: (eventUuid: string) => ["check-in", "gates", eventUuid] as const,
  stats: (eventUuid: string) => ["check-in", "stats", eventUuid] as const,
  list: (eventUuid: string, page: number) => ["check-in", "list", eventUuid, page] as const,
  ticketQr: (ticketUuid: string) => ["check-in", "ticket-qr", ticketUuid] as const,
};

export function useCheckInGatesQuery(eventUuid: string, enabled = true) {
  return useQuery({
    queryKey: checkInKeys.gates(eventUuid),
    queryFn: () => checkInApi.listGates(eventUuid),
    enabled: enabled && eventUuid.length > 0,
  });
}

export function useAttendanceStatsQuery(eventUuid: string, enabled = true) {
  return useQuery({
    queryKey: checkInKeys.stats(eventUuid),
    queryFn: () => checkInApi.stats(eventUuid),
    enabled: enabled && eventUuid.length > 0,
    refetchInterval: 30_000,
  });
}

export function useCheckInListQuery(eventUuid: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: checkInKeys.list(eventUuid, page),
    queryFn: () => checkInApi.list(eventUuid, page),
    enabled: enabled && eventUuid.length > 0,
  });
}

export function useTicketQrQuery(ticketUuid: string, enabled = true) {
  return useQuery({
    queryKey: checkInKeys.ticketQr(ticketUuid),
    queryFn: () => checkInApi.ticketQr(ticketUuid),
    enabled: enabled && ticketUuid.length > 0,
  });
}

export function useVerifyCheckInMutation(eventUuid: string) {
  return useMutation({
    mutationFn: (qrToken: string) => checkInApi.verify(eventUuid, qrToken),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useScanCheckInMutation(eventUuid: string) {
  return useMutation({
    mutationFn: (payload: { qr_token: string; gate_id?: number }) =>
      checkInApi.scan(eventUuid, payload),
    onError: (error) => toast.error(getApiErrorMessage(error, "Check-in gagal.")),
  });
}

export function useManualCheckInMutation(eventUuid: string) {
  return useMutation({
    mutationFn: (payload: { ticket_code: string; gate_id?: number }) =>
      checkInApi.manual(eventUuid, payload),
    onError: (error) => toast.error(getApiErrorMessage(error, "Check-in manual gagal.")),
  });
}

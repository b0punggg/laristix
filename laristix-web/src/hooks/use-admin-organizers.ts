"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { organizerApi } from "@/services/organizer/organizer-api";
import type { AdminOrganizerListFilters } from "@/types/organizer";

export const adminOrganizerKeys = {
  all: ["admin", "organizers"] as const,
  pending: ["admin", "organizers", "pending"] as const,
  list: (filters: AdminOrganizerListFilters) => ["admin", "organizers", "list", filters] as const,
  detail: (uuid: string) => ["admin", "organizers", "detail", uuid] as const,
};

function invalidateAdminOrganizerQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  uuid?: string,
) {
  queryClient.invalidateQueries({ queryKey: adminOrganizerKeys.pending });
  queryClient.invalidateQueries({ queryKey: adminOrganizerKeys.all });
  if (uuid) {
    queryClient.invalidateQueries({ queryKey: adminOrganizerKeys.detail(uuid) });
  }
}

export function usePendingOrganizersQuery(enabled = true) {
  return useQuery({
    queryKey: adminOrganizerKeys.pending,
    queryFn: () => organizerApi.listPending(),
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminOrganizersQuery(filters: AdminOrganizerListFilters = {}) {
  return useQuery({
    queryKey: adminOrganizerKeys.list(filters),
    queryFn: () => organizerApi.listAdmin(filters),
    staleTime: 30_000,
  });
}

export function useAdminOrganizerQuery(uuid: string, enabled = true) {
  return useQuery({
    queryKey: adminOrganizerKeys.detail(uuid),
    queryFn: () => organizerApi.showAdmin(uuid),
    enabled: enabled && uuid.length > 0,
  });
}

export function useApproveOrganizerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => organizerApi.approve(uuid),
    onSuccess: (response, uuid) => {
      invalidateAdminOrganizerQueries(queryClient, uuid);
      toast.success(response.message ?? "Organizer approved successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to approve organizer."));
    },
  });
}

export function useRejectOrganizerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => organizerApi.reject(uuid),
    onSuccess: (response, uuid) => {
      invalidateAdminOrganizerQueries(queryClient, uuid);
      toast.success(response.message ?? "Organizer registration rejected.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to reject organizer."));
    },
  });
}

export function useSuspendOrganizerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => organizerApi.suspend(uuid),
    onSuccess: (response, uuid) => {
      invalidateAdminOrganizerQueries(queryClient, uuid);
      toast.success(response.message ?? "Organizer suspended successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to suspend organizer."));
    },
  });
}

export function useActivateOrganizerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => organizerApi.activate(uuid),
    onSuccess: (response, uuid) => {
      invalidateAdminOrganizerQueries(queryClient, uuid);
      toast.success(response.message ?? "Organizer activated successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to activate organizer."));
    },
  });
}

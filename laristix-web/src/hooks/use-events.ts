"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/config/env";
import { getApiErrorMessage } from "@/lib/api/client";
import { eventApi } from "@/services/event/event-api";
import type { CreateEventPayload, EventListFilters, UpdateEventPayload, AdminEventListFilters } from "@/types/event";

export const eventKeys = {
  all: ["events"] as const,
  list: (filters: EventListFilters) => ["events", "list", filters] as const,
  adminList: (filters: AdminEventListFilters) => ["events", "admin", "list", filters] as const,
  detail: (uuid: string) => ["events", uuid] as const,
  venues: ["events", "venues"] as const,
  categories: ["events", "categories"] as const,
};

export function useEventsQuery(filters: EventListFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventApi.list(filters),
  });
}

export function useAdminEventsQuery(filters: AdminEventListFilters = {}) {
  return useQuery({
    queryKey: eventKeys.adminList(filters),
    queryFn: () => eventApi.listAdmin(filters),
  });
}

export function useEventQuery(uuid: string, enabled = true) {
  return useQuery({
    queryKey: eventKeys.detail(uuid),
    queryFn: () => eventApi.show(uuid),
    enabled: enabled && uuid.length > 0,
  });
}

export function useEventVenuesQuery() {
  return useQuery({
    queryKey: eventKeys.venues,
    queryFn: () => eventApi.venues(),
  });
}

export function useEventCategoriesQuery() {
  return useQuery({
    queryKey: eventKeys.categories,
    queryFn: () => eventApi.categories(),
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventApi.create(payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Event created.");
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      router.push(routes.organizerEventEdit(response.data.uuid));
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useUpdateEventMutation(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventPayload) => eventApi.update(uuid, payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Event updated.");
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(uuid) });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function usePublishEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => eventApi.publish(uuid),
    onSuccess: (response, uuid) => {
      toast.success(response.message ?? "Event published.");
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(uuid) });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDraftEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => eventApi.draft(uuid),
    onSuccess: (response, uuid) => {
      toast.success(response.message ?? "Event reverted to draft.");
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(uuid) });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (uuid: string) => eventApi.delete(uuid),
    onSuccess: (response) => {
      toast.success(response.message ?? "Event deleted.");
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      router.push(routes.organizerEvents);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

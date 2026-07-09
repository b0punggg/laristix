"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { adminApi } from "@/services/admin/admin-api";

export const adminWaitingRoomKeys = {
  all: ["admin", "waiting-room"] as const,
  list: (search: string, activeOnly: boolean) =>
    ["admin", "waiting-room", "list", search, activeOnly] as const,
};

export function useAdminWaitingRoomQuery(search = "", activeOnly = false) {
  return useQuery({
    queryKey: adminWaitingRoomKeys.list(search, activeOnly),
    queryFn: () =>
      adminApi.listWaitingRoomQueues({
        search: search.trim() || undefined,
        active_only: activeOnly || undefined,
      }),
    refetchInterval: 8_000,
    staleTime: 5_000,
  });
}

export function usePromoteWaitingRoomEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventUuid: string) => adminApi.promoteWaitingRoomEvent(eventUuid),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: adminWaitingRoomKeys.all });
      toast.success(response.message ?? "Batch admission berhasil dijalankan.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Gagal menjalankan batch admission."));
    },
  });
}

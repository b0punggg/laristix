"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { organizerApi } from "@/services/organizer/organizer-api";
import type { InviteOrganizerMemberPayload, UpdateOrganizerMemberPayload } from "@/types/organizer";

export const organizerMemberKeys = {
  list: ["organizer", "members"] as const,
};

export function useOrganizerMembersQuery(enabled = true) {
  return useQuery({
    queryKey: organizerMemberKeys.list,
    queryFn: () => organizerApi.listMembers(),
    enabled,
    staleTime: 30_000,
  });
}

export function useInviteOrganizerMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteOrganizerMemberPayload) => organizerApi.inviteMember(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: organizerMemberKeys.list });
      toast.success(response.message ?? "Undangan terkirim.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Gagal mengundang anggota."));
    },
  });
}

export function useUpdateOrganizerMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: number;
      payload: UpdateOrganizerMemberPayload;
    }) => organizerApi.updateMember(memberId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: organizerMemberKeys.list });
      toast.success(response.message ?? "Anggota diperbarui.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Gagal memperbarui anggota."));
    },
  });
}

export function useRemoveOrganizerMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => organizerApi.removeMember(memberId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: organizerMemberKeys.list });
      toast.success(response.message ?? "Anggota dihapus.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Gagal menghapus anggota."));
    },
  });
}

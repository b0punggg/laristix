"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveAuthRedirectPath } from "@/lib/auth-redirect";
import { getApiErrorMessage } from "@/lib/api/client";
import { authApi } from "@/services/auth/auth-api";
import { authKeys } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useOrganizerStore } from "@/stores/organizer-store";

export const organizerInvitationKeys = {
  list: ["auth", "organizer-invitations"] as const,
};

function syncOrganizerFromUser(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  const organizerId = user?.active_organizer?.id ?? null;
  useOrganizerStore.getState().setActiveOrganizerId(organizerId);
}

export function useOrganizerInvitationsQuery(enabled = true) {
  return useQuery({
    queryKey: organizerInvitationKeys.list,
    queryFn: () => authApi.organizerInvitations(),
    enabled,
    staleTime: 30_000,
  });
}

export function useAcceptOrganizerInvitationMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (memberId: number) => authApi.acceptOrganizerInvitation(memberId),
    onSuccess: (response) => {
      const user = response.data;
      setUser(user);
      syncOrganizerFromUser(user);
      queryClient.setQueryData(authKeys.me, user);
      queryClient.setQueryData(authKeys.session, user);
      queryClient.invalidateQueries({ queryKey: authKeys.organizers });
      queryClient.invalidateQueries({ queryKey: organizerInvitationKeys.list });
      toast.success(response.message ?? "Undangan diterima.");
      router.replace(resolveAuthRedirectPath(user.primary_role));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Gagal menerima undangan."));
    },
  });
}

export function useDeclineOrganizerInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => authApi.declineOrganizerInvitation(memberId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: organizerInvitationKeys.list });
      toast.success(response.message ?? "Undangan ditolak.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Gagal menolak undangan."));
    },
  });
}

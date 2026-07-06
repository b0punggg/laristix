"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/config/env";
import { resolveAuthRedirectPath } from "@/lib/auth-redirect";
import { getApiErrorMessage } from "@/lib/api/client";
import { authApi } from "@/services/auth/auth-api";
import { organizerApi } from "@/services/organizer/organizer-api";
import { organizerInvitationKeys } from "@/hooks/use-organizer-invitations";
import { useAuthStore } from "@/stores/auth-store";
import { useOrganizerStore } from "@/stores/organizer-store";
import type {
  CreateOrganizerPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
  session: ["auth", "session"] as const,
  organizers: ["auth", "organizers"] as const,
};

async function fetchAuthSession(
  setUser: (user: ReturnType<typeof useAuthStore.getState>["user"]) => void,
) {
  try {
    const me = await authApi.me();
    setUser(me);
    syncOrganizerFromUser(me);
    return me;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      setUser(null);
      return null;
    }

    throw error;
  }
}

function syncOrganizerFromUser(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  const organizerId = user?.active_organizer?.id ?? null;
  useOrganizerStore.getState().setActiveOrganizerId(organizerId);
}

function redirectAfterAuth(
  primaryRole: string,
  router: ReturnType<typeof useRouter>,
  redirectTo?: string | null,
) {
  router.replace(resolveAuthRedirectPath(primaryRole, redirectTo));
}

export function useMeQuery(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => fetchAuthSession(setUser),
    enabled: enabled && user !== null,
    retry: false,
    staleTime: 60_000,
  });
}

/** Always validates the Sanctum session with the backend (for protected pages). */
export function useAuthSessionQuery(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => fetchAuthSession(setUser),
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    gcTime: 0,
  });
}

export function useLoginMutation(redirectTo?: string | null) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (response) => {
      const user = response.data;
      setUser(user);
      syncOrganizerFromUser(user);
      queryClient.setQueryData(authKeys.me, user);
      queryClient.setQueryData(authKeys.session, user);
      toast.success(response.message ?? "Login successful.");

      try {
        const invitations = await authApi.organizerInvitations();
        queryClient.setQueryData(organizerInvitationKeys.list, invitations);

        if (invitations.length > 0) {
          router.replace(routes.selectOrganizer);
          return;
        }
      } catch {
        // Non-blocking: fall through to default redirect.
      }

      redirectAfterAuth(user.primary_role, router, redirectTo);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Invalid credentials."));
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Registration successful.");
      const email = response.data?.email;
      const destination = email
        ? `${routes.verifyEmailPending}?email=${encodeURIComponent(email)}`
        : routes.login;
      router.push(destination);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Registration failed."));
    },
  });
}

export function useLogoutMutation(redirectTo: string = routes.login) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clear);
  const clearOrganizer = useOrganizerStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onMutate: () => {
      clearAuth();
      clearOrganizer();
      queryClient.setQueryData(authKeys.me, null);
      queryClient.setQueryData(authKeys.session, null);
      queryClient.cancelQueries({ queryKey: authKeys.me });
      queryClient.cancelQueries({ queryKey: authKeys.session });
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: authKeys.me });
      queryClient.removeQueries({ queryKey: authKeys.session });
      router.replace(redirectTo);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Reset link sent if the email exists.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Password reset successful.");
      router.push(routes.login);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: (response) => {
      toast.success(response.message ?? "Verification email sent.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useOrganizersQuery(enabled = true) {
  return useQuery({
    queryKey: authKeys.organizers,
    queryFn: () => authApi.organizers(),
    enabled,
    staleTime: 30_000,
  });
}

export function useSwitchOrganizerMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (organizerId: number) => authApi.switchOrganizer({ organizer_id: organizerId }),
    onSuccess: (user) => {
      setUser(user);
      syncOrganizerFromUser(user);
      queryClient.setQueryData(authKeys.me, user);
      queryClient.invalidateQueries({ queryKey: authKeys.organizers });
      toast.success("Organizer switched.");
      redirectAfterAuth(user.primary_role, router);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not switch organizer."));
    },
  });
}

export function useCreateOrganizerMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateOrganizerPayload) => organizerApi.create(payload),
    onSuccess: async (response) => {
      const user = await authApi.me();
      setUser(user);
      syncOrganizerFromUser(user);
      queryClient.setQueryData(authKeys.me, user);
      queryClient.setQueryData(authKeys.session, user);
      queryClient.invalidateQueries({ queryKey: authKeys.organizers });

      const status = response.data.status;
      if (status === "pending") {
        toast.success(
          response.message ??
            "Organizer created. It is pending platform approval — you can still access the workspace.",
        );
      } else {
        toast.success(response.message ?? "Organizer created successfully.");
      }

      redirectAfterAuth(user.primary_role, router);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuth();
        queryClient.setQueryData(authKeys.me, null);
        queryClient.setQueryData(authKeys.session, null);
        toast.error("Sesi Anda telah berakhir. Silakan masuk kembali.");
        router.replace(routes.loginWithRedirect(routes.createOrganizer));
        return;
      }

      toast.error(getApiErrorMessage(error, "Could not create organizer."));
    },
  });
}
